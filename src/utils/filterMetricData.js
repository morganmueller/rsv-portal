import memoize from "memoizee";
import { interpolate } from "./interpolate";

/**
 * Filters the flat long-form data by exact metric name.
 * Returns array: [{ date, value }]
 */
export const getMetricData = memoize(function (
  data,
  { metric, submetric, display } // ← remove default here
) {
  const normalizedDisplay = typeof display === "string" ? display.trim().toLowerCase() : null;

  const filtered = data.filter((d) => {
    const rowDisplay = typeof d.display === "string" ? d.display.trim().toLowerCase() : "unknown";
    const match =
      d.metric === metric &&
      (submetric === undefined || d.submetric?.trim() === submetric) &&
      (normalizedDisplay === null || rowDisplay === normalizedDisplay);

    if (!match && d.metric === metric) {
      console.log("⛔️ Rejected row:", d);
    }

    return match;
  });

  console.log(`✅ getMetricData('${metric}', submetric: '${submetric}', display: '${display}') matched ${filtered.length} rows`);

  const uniqueSubmetrics = [...new Set(data.map(d => d.metric === metric ? d.submetric : null).filter(Boolean))];
  console.log("🔎 Available submetrics for", metric, ":", uniqueSubmetrics);

  return filtered.map((d) => ({
    date: d.date,
    value: +d.value,
    ...(submetric === undefined && d.submetric ? { submetric: d.submetric } : {}),
  }));
}, { length: 2 });




/**
 * Pivot data to: [{ date, visits, hospitalizations }]
 * Matches metrics like "ARI visits" and "ARI hospitalizations"
 */
export function pivotMetricToViews(
  data,
  baseMetric,
  groupField = null,
  viewSuffix = "", // e.g. "by age group"
  display = "Percent"
) {
  const grouped = {};

  data.forEach((d) => {
    if (
      d.display !== display ||
      !d.metric.startsWith(baseMetric) ||
      (viewSuffix && !d.metric.endsWith(viewSuffix))
    ) {
      return;
    }

    const metricWithoutPrefix = d.metric.replace(`${baseMetric} `, "");
    const viewType = viewSuffix
      ? metricWithoutPrefix.replace(` ${viewSuffix}`, "").toLowerCase()
      : metricWithoutPrefix.toLowerCase();

    if (!["visits", "hospitalizations"].includes(viewType)) return;

    const groupValue = groupField ? d[groupField]?.trim() : null;
    const key = groupField ? `${d.date}|${groupValue}` : d.date;

    if (!grouped[key]) {
      grouped[key] = {
        date: d.date,
        ...(groupField ? { [groupField]: groupValue } : {}),
      };
    }

    grouped[key][viewType] = +d.value;
  });

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Hydrates a config object by injecting filtered data into each section.
 * Sections must declare `chart.props.metricName` or `chart.props.baseMetric`
 */



export function hydrateConfigData(config, flatData, variables = {}) {
  const result = { ...config, data: {} };

  for (const section of config.sections) {
    const props = section.chart?.props || {};
    const dataKey = section.dataSourceKey || props.dataSourceKey;

    const metricName = props.metricName;
    const baseMetric = props.baseMetric;
    const submetric = props.submetric;
    const groupField = props.groupField;
    const display = props.hasOwnProperty("display") ? props.display : 
    props.hasOwnProperty("defaultDisplay") ? props.defaultDisplay :
    variables.display ?? undefined;

    // ✅ NEW: support multiple metrics even without chart.type
    if (Array.isArray(props.metrics)) {
      console.log(`📊 Hydrating ${dataKey} using multiple metrics:`, props.metrics);
      result.data[dataKey] = props.metrics.reduce((acc, metric) => {
        acc[metric] = getMetricData(flatData, { metric, submetric, display });
        return acc;
      }, {});
      continue;
    }

    if (props.pivotView && baseMetric) {
      console.log(`↔️ Hydrating ${dataKey} via pivotMetricToViews with baseMetric:`, baseMetric);
      result.data[dataKey] = pivotMetricToViews(flatData, baseMetric, groupField, variables.view ? `by ${groupField}` : "", display);
    } else if (metricName) {
      console.log(`📊 Hydrating ${dataKey} using getMetricData with:`, { metricName, submetric, display });
      result.data[dataKey] = getMetricData(flatData, { metric: metricName, submetric, display });
    } else {
      console.warn(`⚠️ Section "${section.id}" missing metricName or baseMetric`);
    }

    console.log(`📥 Resulting ${dataKey} row count:`, result.data[dataKey]?.length || 0);
  }

  return result;
}


