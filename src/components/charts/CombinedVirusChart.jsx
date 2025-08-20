import React from "react";
import PropTypes from "prop-types";
import TrendSubtitle from "../controls/TrendSubtitle";
import { getTrendFromTimeSeries, formatDate } from "../../utils/trendUtils";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";
import VegaLiteWrapper from "./VegaLiteWrapper";

const CombinedVirusChart = ({ data = {}, view = "visits", footnote, title }) => {
  if (!data || (!Array.isArray(data) && typeof data !== "object")) return null;

  const ariSeries = data["ARI visits"] || data["ARI hospitalizations"] || [];
  const trend = getTrendFromTimeSeries(ariSeries, "value");
  const latestWeek = ariSeries?.at?.(-1)?.date;

  const trendClass =
    trend?.direction === "up" ? "trend-up" :
    trend?.direction === "down" ? "trend-down" : "trend-neutral";

  const fullVars = {
    date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
    trend: trend
      ? `<span class="${trendClass}">${trend.label} ${trend.value}</span>`
      : "not changed",
  };

  const rawSubtitleTemplate =
    `<span class="bg-highlight">${(view === "hospitalizations" ? "Hospitalizations" : "Visits")}</span>` +
    " for the week of {date} have {trend} since the previous week";

  const resolvedTitle = title?.replace("{view}", view);
  const subtitle = <TrendSubtitle template={rawSubtitleTemplate} variables={fullVars} />;

  const flattened = Array.isArray(data)
    ? data.map((row) => ({
        ...row,
        date: new Date(row.date),
        value: isNaN(+row.value) ? null : +row.value,
        valueRaw: row.value,
        series: (row.series || "")
          .replace(" visits", "")
          .replace(" hospitalizations", "")
          .replace("COVID-19", "COVID")
          .replace("Influenza", "Flu"),
      }))
    : Object.entries(data).flatMap(([seriesName, rows]) =>
        (rows || []).map((row) => ({
          ...row,
          date: new Date(row.date),
          value: isNaN(+row.value) ? null : +row.value,
          valueRaw: row.value,
          series: seriesName
            .replace(" visits", "")
            .replace(" hospitalizations", "")
            .replace("COVID-19", "COVID")
            .replace("Influenza", "Flu"),
        }))
      );

  const ARI_COLOR = tokens.colors?.orangePrimary ?? "#FF6600";
  const seriesDomain = ["COVID", "Flu", "RSV"];
  const seriesRange = [
    tokens.colorScales.covid[1],
    tokens.colorScales.flu[0],
    tokens.colorScales.rsv[0],
  ];

  const valueTooltipField = flattened.some(d => d?.valueRaw != null)
    ? { field: "valueRaw", title: "Reported", type: "nominal" }
    : { field: "value", title: "Reported", type: "quantitative" };


const ariTopSpec = {
  width: "container",
  autosize: { type: "fit", contains: "padding", resize: true },
  config: {
    background: "#FFFFFF",
    axis: {
      labelFont: "Inter, sans-serif",
      titleFont: "Inter, sans-serif",
      labelColor: "#4B5563",
      titleColor: "#374151",
      labelFontSize: 12,
    },
    axisX: { ticks: true, domain: true, domainColor: "lightgray", grid: false },
    axisY: { domain: false, ticks: false, tickCount: 3, orient: "left", gridDash: [2] },
    view: { stroke: "transparent" },
  },
  title: {
    text: resolvedTitle,
    subtitlePadding: 10,
    fontWeight: "normal",
    anchor: "start",
    fontSize: 11,
    baseline: "top",
    dy: -10,
    subtitleFontSize: 13,
  },
  transform: [
    { calculate: "year(datum.date)", as: "year" },
    { calculate: "month(datum.date)", as: "month" },
    { calculate: "dayofyear(datum.date)", as: "day" },
    {
      calculate: "month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1",
      as: "startYear",
    },
    {
      calculate:
        "(datetime(year(datum.date), month(datum.date), date(datum.date))" +
        " - datetime(month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1, 8, 1))" +
        " / (1000 * 60 * 60 * 24) + 1",
      as: "dayOfSeason",
    },
    { filter: "datum.series === 'ARI'" },
  ],
  layer: [
    {
      mark: { type: "area", interpolate: "linear", opacity: 0.15, color: ARI_COLOR },
      encoding: {
        x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: 6 }, scale: { padding: 10 } },
        y: { field: "value", type: "quantitative" },
      },
    },
    {
      mark: { type: "line", interpolate: "linear", strokeWidth: 3, point: { filled: true, size: 40 } },
      encoding: {
        x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: 6 }, scale: { padding: 10 } },
        y: { field: "value", type: "quantitative", axis: { title: null, tickCount: 4 } },
        color: { value: ARI_COLOR },
        tooltip: [
          { field: "date", type: "temporal", format: "%d %b %Y" },
          valueTooltipField,
        ],
      },
    },
    {
      mark: { type: "point", size: 300, opacity: 0.001 },
      encoding: {
        x: { field: "date", type: "temporal" },
        y: { field: "value", type: "quantitative" },
        color: { value: ARI_COLOR },
        tooltip: [
          { field: "date", type: "temporal", format: "%d %b %Y" },
          valueTooltipField,
        ],
      },
    },
  ],
};

const facetSpec = {
  width: "container",                        
  autosize: { type: "fit", contains: "padding", resize: true },
  config: ariTopSpec.config,
  transform: ariTopSpec.transform.slice(0, -1), 
  facet: {
    field: "series",
    title: null,
    type: "nominal",
    columns: 10,                              
    header: { labelAlign: "left", labelFontSize: 12, labelColor: "#374151", labelPadding: 5 },
  },
  spec: {
    width: 380,                               
    height: 100,
    transform: [{ filter: "datum.series !== 'ARI'" }],
    layer: [
      {
        mark: { type: "area", interpolate: "linear", opacity: 0.15 },
        encoding: {
          x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: 6 }, scale: { padding: 10 } },
          y: { field: "value", type: "quantitative" },
          color: {
            field: "series",
            type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange },
            legend: null,
          },
        },
      },
      {
        mark: { type: "line", interpolate: "linear", strokeWidth: 3, point: { size: 40 } },
        encoding: {
          x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: 6 }, scale: { padding: 10 } },
          y: { field: "value", type: "quantitative", axis: { title: null, tickCount: 4 } },
          color: {
            field: "series",
            type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange },
            legend: null,
          },
          tooltip: [
            { field: "date", type: "temporal", format: "%d %b %Y" },
            valueTooltipField,
            { field: "series", type: "nominal" },
          ],
        },
      },
      {
        mark: { type: "point", size: 300, opacity: 0.001 },
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "value", type: "quantitative" },
          color: {
            field: "series",
            type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange },
            legend: null,
          },
          tooltip: [
            { field: "date", type: "temporal", format: "%d %b %Y" },
            valueTooltipField,
            { field: "series", type: "nominal" },
          ],
        },
      },
    ],
  },
};


return (
  <div>
    <VegaLiteWrapper
      data={flattened}
      specTemplate={ariTopSpec}
      rendererMode="svg"
    />

    <VegaLiteWrapper
      data={flattened}
      specTemplate={facetSpec}
      rendererMode="svg"
    />

    <ChartFooter
      latestDate={latestWeek ? formatDate(latestWeek) : "N/A"}
      footnote={footnote}
    />
  </div>
);

};

CombinedVirusChart.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  view: PropTypes.string,
  footnote: PropTypes.string,
  title: PropTypes.string,
};

export default CombinedVirusChart;
