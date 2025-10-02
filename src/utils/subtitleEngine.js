import React from "react";
import TrendSubtitle from "../components/controls/TrendSubtitle";
import { getText } from "./contentUtils";
import {
  getTrendFromTimeSeries,
  getTrendInfo,
  formatDate,
  getLatestWeekFromData,
  isFirstWeekFromData,
} from "./trendUtils";
import { toSourceVirus, coerceRowVirus, coerceRowView } from "./virusMap";

/** Small helpers used by both pages */
export const viewDisplayLabels = {
  visits: "Visits",
  hospitalizations: "Hospitalizations",
};
export const viewDisplayLabelsPreposition = {
  visits: "to",
  hospitalizations: "from",
};
export const virusLowercaseDisplay = {
  "COVID-19": "COVID-19",
  Flu: "flu",
  RSV: "RSV",
};
export const virusDisplayLabelsArticle = {
  "COVID-19": "a",
  Flu: "a",
  RSV: "an",
};

/** Flatten a keyed series slice into an array with `series` attached */
export function flattenSlice(slice) {
  if (Array.isArray(slice)) return slice;
  return Object.entries(slice || {}).flatMap(([seriesName, rows]) =>
    (rows || []).map((row) => ({ ...row, series: seriesName }))
  );
}

/** Filter rows for the currently-active virus + view (handles multiple shapes) */
export function filterRowsForVirusView(rows, activeVirus, view) {
  const sourceVirus = toSourceVirus(activeVirus); // "Influenza" for "Flu"
  return (
    rows?.filter?.((row) => {
      const vRaw = coerceRowVirus(row);
      const v = vRaw ? toSourceVirus(vRaw) : null;
      const vw = coerceRowView(row);
      if (v && vw) return v === sourceVirus && vw === view;
      const seriesStr = String(row.series || row.metric || row.virus || "");
      return seriesStr.includes(`${sourceVirus} ${view}`);
    }) ?? []
  );
}

/**
 * Build the <TrendSubtitle/> React node (or null) for any section.
 * Central contract used by both ConfigDrivenPage and DataExplorerPage.
 *
 * @param {object} args
 *  - section: config section object
 *  - dataSlice: the hydrated data slice for this section (array or keyed object)
 *  - context: { activeVirus, view }
 *  - group: { options, active, onChange }  (optional – used for group dropdown token)
 */
export function renderSectionSubtitle({ section, dataSlice, context, group }) {
  const { activeVirus, view } = context;

  // Skip if no template
  const rawTemplate =
    typeof section.subtitle === "string" && section.subtitle.includes(".")
      ? getText(section.subtitle)
      : section.subtitle || "";
  if (!rawTemplate) return null;

  // Prepare data
  const flattened = flattenSlice(dataSlice);

  // Special case: overview combined-virus chart uses ARI series for WoW
  const isCombined = section.id === "combined-virus";

  // Choose the subset that determines the trend + latest date
  let seriesForTrend = flattened;
  if (!isCombined) {
    seriesForTrend = filterRowsForVirusView(flattened, activeVirus, view);
  } else {
    const seriesKey =
      view === "visits"
        ? "Respiratory illness visits"
        : "Respiratory illness hospitalizations";
    seriesForTrend = flattened.filter(
      (r) => String(r.series || "") === seriesKey
    );
  }

  // Early out if we only have the very first week (avoid awkward trend)
  const firstWeekOnly = isFirstWeekFromData(seriesForTrend);
  if (firstWeekOnly) return null;

  // Compute trend
  const yKey = section.chart?.props?.yField || "value";
  const trendObj = getTrendFromTimeSeries(seriesForTrend, yKey);
  const trendInfo = getTrendInfo({
    trendDirection: trendObj?.direction,
    metricLabel: viewDisplayLabels[view],
    virus: activeVirus,
  });

  // Format "increased 5%" and force a trailing % when needed
  const labelPlusValue = trendObj
    ? `${trendObj.label}${
        trendObj.value != null && String(trendObj.value).trim() !== ""
          ? " " + String(trendObj.value).trim()
          : ""
      }`
    : "not changed";

  const labelPlusValuePct = /%/.test(labelPlusValue)
    ? labelPlusValue
    : labelPlusValue.replace(/(-?\d+(?:\.\d+)?)(?!.*\d)/, "$1%");

  const latestWeek = getLatestWeekFromData(seriesForTrend);

  // Assemble variables
  const trendClass =
    trendObj?.direction === "up"
      ? "trend-up"
      : trendObj?.direction === "down"
      ? "trend-down"
      : "trend-neutral";

  const variables = {
    virus: activeVirus,
    view,
    viewLabel: viewDisplayLabels[view],
    viewLabelPreposition: viewDisplayLabelsPreposition[view],
    virusLowercase: virusLowercaseDisplay[activeVirus],
    virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
    date: latestWeek ? `<span class="bg-highlight">${formatDate(latestWeek)}</span>` : "",
    trend: `<span class="${trendClass}">${labelPlusValuePct}</span>`,
    trendDirection: trendObj?.direction,
    arrow: trendInfo?.arrow,
    directionText: trendInfo?.directionText,
    trendColor: trendInfo?.trendColor,
  };

  // If the template contains {group}, pass group dropdown props through
  const groupProps =
    rawTemplate.includes("{group}") && group
      ? {
          options: group.options || [],
          active: group.active || "",
          onChange: group.onChange || (() => {}),
        }
      : undefined;

  return <TrendSubtitle template={rawTemplate} variables={variables} groupProps={groupProps} />;
}
