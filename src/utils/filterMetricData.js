import memoize from "memoizee";
import { interpolate } from "./interpolate";

/**
 * Filters flat long-form data by exact metric, optional submetric, and display.
 * Returns array: [{ date, value, valueRaw, ... }]
 */
export const getMetricData = memoize(function (
  data,
  { metric, submetric, display, groupField }
) {
  const normalizedDisplay = typeof display === "string"
    ? display.trim().toLowerCase()
    : null;

  const filtered = data.filter((d) => {
    const rowMetric = d.metric;
    const rowSubmetric = d.submetric?.trim();
    const rowDisplay = typeof d.display === "string"
      ? d.display.trim().toLowerCase()
      : "unknown";

    const matchesMetric = rowMetric === metric;

    const matchesSubmetric =
      groupField ? true :
      (submetric === undefined &&
        (!rowSubmetric || rowSubmetric === "Total" || rowSubmetric === "Overall")) ||
      rowSubmetric === submetric;

    const matchesDisplay =
      normalizedDisplay === null || rowDisplay === normalizedDisplay;

    const isMatch = matchesMetric && matchesSubmetric && matchesDisplay;

    if (!isMatch && matchesMetric) {
      console.log("❌ Rejected row:", d);
    }
    if (matchesMetric) {
      console.log("🔬 Submetric:", JSON.stringify(d.submetric));
      console.log("🔬 Display:", JSON.stringify(d.display));
    }

    return isMatch;
  });

  console.log(
    `✅ getMetricData('${metric}', submetric: ${submetric ?? "[ALL]"}, display: '${display}') matched ${filtered.length} rows`
  );

  console.log(
    "🔎 Available submetrics for",
    metric,
    ":",
    [...new Set(data.filter((d) => d.metric === metric).map((d) => d.submetric).filter(Boolean))]
  );

  console.log(
    "📋 Available metrics in data:",
    [...new Set(data.map((d) => d.metric))]
  );

  return filtered.map((d) => ({
    date: new Date(d.date),
    value: +d.value,
    valueRaw: d.valueRaw ?? d.value,
    ...(groupField && d[groupField] ? { [groupField]: d[groupField] } : {}),
    ...(submetric === undefined && d.submetric ? { submetric: d.submetric } : {}),
  }));
}, { length: 2 });

/**
 * Pivots long-form metric data to view-separated wide form.
 * Returns array: [{ date, visits, hospitalizations }]
 */
export function pivotMetricToViews(
  data,
  baseMetric,
  groupField = null,
  viewSuffix = "",
  display = "Percent"
) {
  const grouped = {};

  data.forEach((d) => {
    const { metric, value, display: rowDisplay } = d;
    if (
      rowDisplay !== display ||
      !metric.startsWith(baseMetric) ||
      (viewSuffix && !metric.endsWith(viewSuffix))
    ) return;

    const label = viewSuffix
      ? metric.replace(`${baseMetric} `, "").replace(` ${viewSuffix}`, "")
      : metric.replace(`${baseMetric} `, "");

    const viewType = label.toLowerCase();
    if (!["visits", "hospitalizations"].includes(viewType)) return;

    const groupValue = groupField ? d[groupField]?.trim() : null;
    const key = groupField ? `${d.date}|${groupValue}` : d.date;

    if (!grouped[key]) {
      grouped[key] = {
        date: d.date,
        ...(groupField ? { [groupField]: groupValue } : {}),
      };
    }

    grouped[key][viewType] = +value;
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
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

    // 🧪 Case: multiple metrics (for grouped charts/statcards/combined charts)
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
          }).map(row => ({ ...row, series: metric }))
        );
      }
      continue;
    }    

    // ↔️ Case: pivoted view
    if (props.pivotView && baseMetric) {
      console.log(`↔️ Hydrating ${dataKey} via pivotMetricToViews`, baseMetric);
      result.data[dataKey] = pivotMetricToViews(
        flatData,
        baseMetric,
        groupField,
        variables.view ? `by ${groupField}` : "",
        display
      );
    }
    // 📚 Case: multiple metricNames
    else if (Array.isArray(metricName)) {
      console.log(`📊 Hydrating ${dataKey} with multiple metricNames:`, metricName);
      result.data[dataKey] = metricName.flatMap((m) =>
        getMetricData(flatData, {
          metric: m,
          submetric,
          display,
          groupField,
        }).map((row) => ({ ...row, metric: m }))
      );
    }
    // ✅ Case: single metric
    else if (metricName) {
      console.log(`📊 Hydrating ${dataKey} using getMetricData with:`, {
        metricName,
        submetric,
        display,
      });
      result.data[dataKey] = getMetricData(flatData, {
        metric: metricName,
        submetric,
        display,
        groupField,
      });
    } else {
      console.warn(`⚠️ Section "${section.id}" missing metricName or baseMetric`);
    }

    const count = Array.isArray(result.data[dataKey])
      ? result.data[dataKey].length
      : Object.values(result.data[dataKey] || {}).flat().length;

    console.log(`📥 Resulting ${dataKey} row count:`, count);
  }

  return result;
}
