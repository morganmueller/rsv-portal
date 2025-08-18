import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getText } from "../../utils/contentUtils";
import { loadCSVData } from "../../utils/loadCSVData";
import { getMetricData } from "../../utils/filterMetricData";
import "./DynamicParagraph.css"; // <-- add this line

function fmtWeekDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return String(dateLike);
  const y = d.getFullYear() < 100 ? 2000 + d.getFullYear() : d.getFullYear();
  const fixed = new Date(y, d.getMonth(), d.getDate());
  return fixed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function round1Str(v) {
  const num = Number(v);
  if (!Number.isFinite(num)) return null;
  const r = Math.round(num * 10) / 10;
  return Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : String(r);
}

// very small, predictable slug for BEM-ish class names
const slug = (s) => (s || "")
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

export default function DynamicParagraph({
  data,
  dataPath = "/data/otherRespData.csv",
  metricName,                   // generic: pass via config
  display = "Percent",          // generic: pass via config
  groupField,                   // generic: pass via config if needed
  textKeyBase = "overview.otherResp",
  order = [
    "Adenovirus",
    "Human Coronavirus",
    "Enterovirus/Rhinovirus",
    "Human Metapneumovirus",
    "Influenza",
    "Parainfluenza",
    "Respiratory Syncytial Virus",
  ],
  className = "",
}) {
  const [fallbackRows, setFallbackRows] = useState(null);
  const [err, setErr] = useState(null);

  // i18n text + labels from text.json
  const intro = getText(`${textKeyBase}.intro`);
  const sentenceTpl = getText(`${textKeyBase}.sentence`); // "For the week of {date}, ... {list}."
  const labels = getText(`${textKeyBase}.labels`) || {};

  // self-load if no hydrated data is provided
  useEffect(() => {
    let alive = true;
    const noDataProvided = !data || (Array.isArray(data) && data.length === 0);
    if (noDataProvided && dataPath) {
      loadCSVData(dataPath)
        .then(rows => { if (alive) setFallbackRows(rows); })
        .catch(e => { if (alive) setErr(e.message); });
    }
    return () => { alive = false; };
  }, [data, dataPath]);

  const sourceRows = data && data.length ? data : (fallbackRows || []);

  // optional metric filtering (generic via your csv helpers)
  const filtered = useMemo(() => {
    if (!sourceRows.length) return [];
    if (!metricName) return sourceRows; // already filtered upstream
    return getMetricData(sourceRows, {
      metric: metricName,
      submetric: undefined,
      display,
      groupField,
    });
  }, [sourceRows, metricName, display, groupField]);

  const latest = useMemo(() => {
    if (!filtered.length) return null;

    // group by ISO day (works for Date objects and strings)
    const byDate = filtered.reduce((acc, r) => {
      const key = r.date instanceof Date ? r.date.toISOString().slice(0,10) : String(r.date);
      (acc[key] ||= []).push(r);
      return acc;
    }, {});

    const dates = Object.keys(byDate)
      .map(d => ({ d, t: new Date(d).getTime() }))
      .filter(x => !Number.isNaN(x.t))
      .sort((a, b) => b.t - a.t);

    if (!dates.length) return null;

    const latestDate = dates[0].d;
    const rows = byDate[latestDate];

    // submetric -> percent map
    const map = new Map(
      rows
        .filter(r => r.submetric)
        .map(r => [r.submetric, r.value ?? r.valueRaw])
    );

    // Build HTML chips in desired order; skip missing values
    const chips = order
      .map(key => {
        const pct = round1Str(map.get(key));
        if (pct == null) return null;
        const label = labels[key] || key;
        const s = slug(label);
        return `
          <span class="chip chip--virus chip--${s}">
            <span class="chip__value">${pct}%</span>
            <span class="chip__label">${label}</span>
          </span>
        `.trim();
      })
      .filter(Boolean);

    return { date: latestDate, chips };
  }, [filtered, order, labels]);

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
      <p dangerouslySetInnerHTML={{ __html: filledSentenceHtml }} />
    </div>
  );
}

DynamicParagraph.propTypes = {
  data: PropTypes.array,
  dataPath: PropTypes.string,
  metricName: PropTypes.string,
  display: PropTypes.string,
  groupField: PropTypes.string,
  textKeyBase: PropTypes.string,
  order: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};
