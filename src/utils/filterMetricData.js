// src/utils/filterMetricData.js
import memoize from "memoizee";
import { interpolate } from "./interpolate";

/** Parse "YYYY-MM-DD" as a LOCAL date (avoid UTC shifting a day). */
export function parseLocalISO(isoLike) {
  if (!isoLike) return null;
  if (isoLike instanceof Date && !Number.isNaN(isoLike.getTime())) return isoLike;

  const s = String(isoLike);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d; // fallback
  }
  const [, y, mm, dd] = m.map(Number);
  return new Date(y, mm - 1, dd); // local midnight
}

/** Canonicalize metric labels so synonyms match (Flu≡Influenza, COVID≡COVID-19). */
function canonMetric(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    // normalize covid variants
    .replace(/covid(?:\s|-)?19/g, "covid-19")
    .replace(/\bcovid\b/g, "covid-19")
    // normalize flu → influenza
    .replace(/\bflu\b/g, "influenza")
    // normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function canonDisplay(s) {
  return typeof s === "string" ? s.trim().toLowerCase() : s ?? "unknown";
}

/**
 * Filters flat long-form data by metric (with canonical matching),
 * optional submetric, and display.
 * Returns array: [{ date: Date, value, valueRaw, ... }]
 */
export const getMetricData = memoize(function (
  data,
  { metric, submetric, display, groupField }
) {
  const normalizedDisplay = canonDisplay(display);
  const targetMetricCanon = canonMetric(metric);

  const filtered = data.filter((d) => {
    const rowMetric = d.metric;
    const rowSubmetric = d.submetric?.trim();
    const rowDisplay = canonDisplay(d.display);

    // FIXED: Use exact match, not startsWith or includes
    // This prevents "COVID-19 deaths by age group" from matching "COVID-19 deaths"
    const rowMetricCanon = canonMetric(rowMetric);
    const matchesMetric = rowMetricCanon === targetMetricCanon;

    // If grouping (e.g., by borough/age), include all submetrics; otherwise default to Overall/Total when submetric is undefined.
    const matchesSubmetric = groupField
      ? true
      : (submetric === undefined &&
          (!rowSubmetric ||
            rowSubmetric === "Total" ||
            rowSubmetric === "Overall")) ||
        rowSubmetric === submetric;

    const matchesDisplay = rowDisplay === normalizedDisplay;

    return matchesMetric && matchesSubmetric && matchesDisplay;
  });

  return filtered.map((d) => ({
    date: parseLocalISO(d.date),
    value: +d.value,
    valueRaw: d.valueRaw ?? d.value,
    metric: d.metric, // 👈 ADD: Preserve original metric name
    submetric: d.submetric, // 👈 ADD: Preserve original submetric
    ...(groupField && d[groupField] ? { [groupField]: d[groupField] } : {}),
    _dateRaw: d.date, // keep original string if needed elsewhere
  }));
}, { length: 2 });

/**
 * Pivots long-form metric data to view-separated wide form.
 * Returns array: [{ date: Date, visits, hospitalizations, ...(groupField?) }]
 */
export function pivotMetricToViews(
  data,
  baseMetric,
  groupField = null,
  viewSuffix = "",
  display = "Percent"
) {
  const grouped = {};
  const baseCanon = canonMetric(baseMetric);
  const displayCanon = canonDisplay(display);
  const suffixCanon = typeof viewSuffix === "string" ? viewSuffix.toLowerCase() : "";

  data.forEach((d) => {
    const rowDisplayCanon = canonDisplay(d.display);
    const metricCanon = canonMetric(d.metric);

    if (rowDisplayCanon !== displayCanon) return;
    if (!metricCanon.startsWith(baseCanon)) return;
    if (suffixCanon && !metricCanon.endsWith(suffixCanon)) return;

    // Extract the view label ("visits" / "hospitalizations") from the canonical string
    const labelCanon = suffixCanon
      ? metricCanon.replace(`${baseCanon} `, "").replace(` ${suffixCanon}`, "")
      : metricCanon.replace(`${baseCanon} `, "");

    const viewType = labelCanon.toLowerCase();
    if (!["visits", "hospitalizations"].includes(viewType)) return;

    const groupValue = groupField ? d[groupField]?.trim() : null;
    const key = groupField ? `${d.date}|${groupValue}` : String(d.date);

    if (!grouped[key]) {
      grouped[key] = {
        date: parseLocalISO(d.date),
        ...(groupField ? { [groupField]: groupValue } : {}),
        _dateRaw: d.date,
      };
    }

    grouped[key][viewType] = +d.value;
  });

  return Object.values(grouped).sort(
    (a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)
  );
}

/**
 * Hydrates config object with filtered data for each section.
 */
export function hydrateConfigData(config, flatData, variables = {}) {
  const result = { ...config, data: {} };

  for (const section of config.sections) {
    const props = section.chart?.props || {};
    const dataKey = section.dataSourceKey || props.dataSourceKey;
    const metricName = props.metricName;
    const baseMetric = props.baseMetric;

    const submetric =
      typeof props.submetric === "string" && props.submetric !== "undefined"
        ? props.submetric
        : undefined;

    const groupField = props.groupField;

    const display = props.display ?? props.defaultDisplay ?? variables.display;

    if (Array.isArray(props.metrics)) {
      const resolved = props.metrics.map((m) => interpolate(m, variables));

      // Custom components (StatGrid, OverviewGrid) get OBJECT form
      if (section.renderAs === "custom") {
        result.data[dataKey] = resolved.reduce((acc, metric) => {
          acc[metric] = getMetricData(flatData, {
            metric,
            submetric,
            display,
            groupField,
          });
          return acc;
        }, {});
      } else {
        // All charts get FLAT ARRAY with 'series' field
        result.data[dataKey] = resolved.flatMap((metric) =>
          getMetricData(flatData, {
            metric,
            submetric,
            display,
            groupField,
          }).map((row) => ({ ...row, series: metric }))
        );
      }
      continue;
    }

    //  Case: pivoted view
    if (props.pivotView && baseMetric) {
      result.data[dataKey] = pivotMetricToViews(
        flatData,
        baseMetric,
        groupField,
        variables.view ? `by ${groupField}` : "",
        display
      );
    }
    // Case: multiple metricNames
    else if (Array.isArray(metricName)) {
      result.data[dataKey] = metricName.flatMap((m) =>
        getMetricData(flatData, {
          metric: m,
          submetric,
          display,
          groupField,
        }).map((row) => ({ ...row, metric: m }))
      );
    }
    //  Case: single metric
    else if (metricName) {
      const filteredData = getMetricData(flatData, {
        metric: metricName,
        submetric,
        display,
        groupField,
      }).filter((d) => {
        // Ensure only rows with exact metricName match are included
        const m = String(d.metric || "").toLowerCase();
        const target = String(metricName || "").toLowerCase();
        return m === target;
      });
      
      // Add metric field to each row so trend matching works
      result.data[dataKey] = filteredData.map(row => ({
        ...row,
        metric: metricName
      }));
      if (Array.isArray(result.data[dataKey])) {
        const seen = new Set();
        result.data[dataKey] = result.data[dataKey].filter((r) => {
          const key = `${r.date?.toISOString?.() ?? r._dateRaw}|${r.submetric ?? ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
    } else {
      console.warn(`⚠️ Section "${section.id}" missing metricName or baseMetric`);
    }
  }

  return result;
}