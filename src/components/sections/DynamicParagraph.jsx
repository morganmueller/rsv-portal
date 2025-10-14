// src/components/bullets/DynamicParagraph.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getText } from "../../utils/contentUtils";
import { loadCSVData } from "../../utils/loadCSVData";
import { getMetricData } from "../../utils/filterMetricData";
import { parseLocalISO } from "../../utils/trendUtils";
import "./DynamicParagraph.css"; 

function fmtWeekDate(dateLike) {
  const d = parseLocalISO(dateLike);   // 👈 ensures local midnight, no UTC shift
  if (!d || Number.isNaN(d.getTime())) return String(dateLike ?? "");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

function round1Str(v) {
  const num = Number(v);
  if (!Number.isFinite(num)) return null;
  const r = Math.round(num * 10) / 10;
  return Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : String(r);
}

// very small, predictable slug for BEM-ish class names
const slug = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// join array of HTML chip strings with Oxford comma semantics
function joinWithOxford(chips) {
  if (chips.length <= 1) return chips.join("");
  const head = chips.slice(0, -1).join(", ");
  const tail = chips[chips.length - 1];
  return `${head}, and ${tail}`;
}

// Default alias map to reconcile config "order" labels with CSV "submetric" values.
// Extend/override by passing `aliasMap` in props if needed.
const DEFAULT_ALIAS_MAP = {
  "Human Coronavirus": "Human Coronaviruses",
  RSV: "Respiratory Syncytial Virus",
  Flu: "Influenza",
};

function resolveSubmetricKey(orderLabel, map, aliasMap) {
  // Priority: explicit map entry; then alias; else the label itself.
  return map?.[orderLabel] ?? aliasMap?.[orderLabel] ?? orderLabel;
}

function formatChipValue(rawValue, displayHint) {
  // If explicitly Percent and <= 100, render with %; otherwise treat as number.
  const num = Number(rawValue);
  if (!Number.isFinite(num)) return null;
  if (displayHint === "Percent" && num <= 100) {
    const s = round1Str(num);
    return s == null ? null : `${s}%`;
  }
  // counts or large “percent” fields: show as number with grouping
  return new Intl.NumberFormat().format(num);
}

export default function DynamicParagraph({
  data,
  dataPath = "",
  metricName,                  // defaulted to "Respiratory panel results" if absent
  display,                     // optional hint; will be inferred per-row if missing/messy
  groupField,                  // defaulted to "submetric" for panel results
  textKeyBase = "",
  order = [],                  // display + chip order
  aliasMap = DEFAULT_ALIAS_MAP, // optional override/extend
  className = "",
}) {
  const [fallbackRows, setFallbackRows] = useState(null);
  const [err, setErr] = useState(null);

  // i18n text + labels from text.json
  const intro = getText(`${textKeyBase}.intro`);
  const sentenceTpl = getText(`${textKeyBase}.sentence`); // "For the week of {date}, ... {list}."
  const labels = getText(`${textKeyBase}.labels`) || {};
  // Let i18n provide a valueKey map if you’d like (order label -> CSV submetric)
  const valueKeyMap = labels.valueKeyMap || null;

  // self-load if no hydrated data is provided
  useEffect(() => {
    let alive = true;
    const noDataProvided = !data || (Array.isArray(data) && data.length === 0);
    if (noDataProvided && dataPath) {
      loadCSVData(dataPath)
        .then((rows) => {
          if (alive) setFallbackRows(rows);
        })
        .catch((e) => {
          if (alive) setErr(e?.message || "Failed to load CSV");
        });
    }
    return () => {
      alive = false;
    };
  }, [data, dataPath]);

  const sourceRows = data && data.length ? data : fallbackRows || [];

  // Defaults tailored for the ED panel section
  const effectiveMetric = metricName || "Respiratory panel results";
  const effectiveGroupField = groupField || "submetric";

  // optional metric filtering (generic via your csv helpers)
  const filtered = useMemo(() => {
    if (!sourceRows.length) return [];

    // Prefer helper when a metricName is provided
    if (effectiveMetric) {
      return getMetricData(sourceRows, {
        metric: effectiveMetric,
        submetric: undefined,
        display, // keep hint in case upstream uses it
        groupField: effectiveGroupField,
      });
    }

    // Auto-detect fallback: if no metricName passed, try to find panel rows
    const panelRows = sourceRows.filter((r) => r.metric === "Respiratory panel results");
    return panelRows.length ? panelRows : sourceRows;
  }, [sourceRows, effectiveMetric, display, effectiveGroupField]);

  const latest = useMemo(() => {
    if (!filtered.length) return null;

    // group by ISO day (works for Date objects and strings)
    const byDate = filtered.reduce((acc, r) => {
      const local = parseLocalISO(r.date);             // 👈 use local parser
      const key = local ? local.toISOString().slice(0, 10) : String(r.date);
      (acc[key] ||= []).push(r);
      return acc;
    }, {});

    const dates = Object.keys(byDate)
      .map((d) => ({ d, t: new Date(d).getTime() }))
      .filter((x) => !Number.isNaN(x.t))
      .sort((a, b) => b.t - a.t);

    if (!dates.length) return null;

    const latestDate = dates[0].d;
    const rows = byDate[latestDate];

    // submetric -> { value, display } map
    const map = new Map(
      rows
        .filter((r) => r[effectiveGroupField])
        .map((r) => [
          r[effectiveGroupField],
          { value: r.value ?? r.valueRaw, display: r.display },
        ])
    );

    // Build HTML chips in desired order; skip missing values
    const chips = order
      .map((displayLabel) => {
        // resolve the CSV submetric key we should read from
        const submetricKey = resolveSubmetricKey(displayLabel, valueKeyMap, aliasMap);
        const entry = map.get(submetricKey);
        if (!entry) return null;

        // Pick display hint: prefer row display, then component prop
        const chipValue = formatChipValue(entry.value, entry.display || display);
        if (chipValue == null) return null;

        const label = labels[displayLabel] || displayLabel;
        const s = slug(label);
        return `
          <span class="chip chip--virus chip--${s}">
            <span class="chip__value">${chipValue}</span>
            <span class="chip__label">${label}</span>
          </span>
        `.trim();
      })
      .filter(Boolean);

    return { date: latestDate, chips };
  }, [filtered, order, labels, valueKeyMap, aliasMap, effectiveGroupField, display]);

  // Nothing to render if we can't build the sentence yet
  if (err || !latest || !sentenceTpl) return null;

  // Create stylized HTML for date + list
  const dateHtml = `<span class="chip chip--date">${fmtWeekDate(latest.date)}</span>`;
  const listHtml = joinWithOxford(latest.chips);

  // Inject HTML into the sentence template
  const filledSentenceHtml = sentenceTpl
    .replace("{date}", dateHtml)
    .replace("{list}", listHtml);

  return (
    <div className={`data-summary-markdown ${className}`} style={{ marginTop: "1rem" }}>
      {intro && <p>{intro}</p>}
      <p className="dp-sentence" dangerouslySetInnerHTML={{ __html: filledSentenceHtml }} />
    </div>
  );
}

DynamicParagraph.propTypes = {
  data: PropTypes.array,
  dataPath: PropTypes.string,
  metricName: PropTypes.string,       // default: "Respiratory panel results"
  display: PropTypes.string,          // optional hint; per-row display is preferred if present
  groupField: PropTypes.string,       // default: "submetric"
  textKeyBase: PropTypes.string,
  order: PropTypes.arrayOf(PropTypes.string),
  aliasMap: PropTypes.object,         // order-label -> CSV submetric key
  className: PropTypes.string,
};
