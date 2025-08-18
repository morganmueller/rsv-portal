import React from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";
import TrendSubtitle from "../controls/TrendSubtitle";
import { getTrendFromTimeSeries, formatDate } from "../../utils/trendUtils";
import { tokens } from "../../styles/tokens";
import { field } from "vega";
import ChartFooter from "./ChartFooter";

const CombinedVirusChart = ({ data = {}, view = "visits",title}) => {
  // Validate data
  if (!data || (!Array.isArray(data) && typeof data !== "object")) {
    return null;
  }

  // Trend subtitle for ARI
  const ariSeries = data["ARI visits"] || data["ARI hospitalizations"] || [];
  const trend = getTrendFromTimeSeries(ariSeries, "value");
  const latestWeek = ariSeries?.at?.(-1)?.date;

  const trendClass =
    trend?.direction === "up"
      ? "trend-up"
      : trend?.direction === "down"
      ? "trend-down"
      : "trend-neutral";

  const fullVars = {
    date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
    trend: trend
      ? `<span class="${trendClass}">${trend.label} ${trend.value}</span>`
      : "not changed",
  };

  const rawSubtitleTemplate =
  `<span class="bg-highlight">${(view === "hospitalizations"
    ? "Hospitalizations"
    : "Visits")}</span>` + " for the week of {date} have {trend} since the previous week";
  
  const resolvedTitle = title?.replace("{view}", view);

  const subtitle = (
    <TrendSubtitle template={rawSubtitleTemplate} variables={fullVars} />
  );

  // Flatten chart data
  const flattened = Array.isArray(data)
  ? data
  : Object.entries(data).flatMap(([seriesName, rows]) =>
      (rows || []).map((row) => ({
        ...row,
        date: new Date(row.date),
        value: isNaN(+row.value) ? null : +row.value,
        valueRaw: row.value, // Preserve original for tooltip
        series: seriesName
          .replace(" visits", "")
          .replace("COVID-19", "COVID")
          .replace("Influenza", "Flu")
          .replace(" hospitalizations", ""),
      }))
    );


  // ensure the date field is a Date object
  const spec = {
    data: { name: "table" },
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
    
    config: {
      background: "#FFFFFF",
      axis: {
        labelFont: "Inter, sans-serif",
        titleFont: "Inter, sans-serif",
        labelColor: "#4B5563",
        titleColor: "#374151",
        labelFontSize: 12,
      },
      axisX: {
        ticks: true,
        domain: true,
        domainColor: "lightgray",
        grid: false,
      },
      axisY: {
        domain: false,
        ticks: false,
        tickCount: 3,
        orient: "left",
        gridDash: [2],
      },
      legend: {
        labelFont: "Inter, sans-serif",
        titleFont: "Inter, sans-serif",
        labelColor: "#6B7280",
        titleColor: "#4B5563",
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
        title: `ARI ${view}`,
        labelFontSize: 16,
      },
      view: { stroke: "transparent" },
    },
    transform: [
      { calculate: "year(datum.date)", as: "year" },
      { calculate: "month(datum.date)", as: "month" },
      { calculate: "dayofyear(datum.date)", as: "day" },
      {
        calculate:
          "month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1",
        as: "startYear",
      },
      {
        calculate:
          "(datetime(year(datum.date), month(datum.date), date(datum.date)) - "
          + "datetime(month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1, 8, 1)) "
          + "/ (1000 * 60 * 60 * 24) + 1",
        as: "dayOfSeason",
      },
    ],
    vconcat: [
      {
        width: 1200,
        layer: [
        // ARI area
          {
            transform: [{ filter: "datum.series === 'ARI'" }],
            mark: {
              type: "area",
              interpolate: "linear",
              opacity: 0.15,
              color: "#FF6600",
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                axis: { title: null, format: "%b %d", tickCount: 6 },
                scale: { padding: 10 },
              },
              y: { field: "value", type: "quantitative" },
            },
          },
          {
            transform: [{ filter: "datum.series === 'ARI'" }],
            mark: {
              type: "line",
              interpolate: "linear",
              strokeWidth: 3,
              point: { filled: true, size: 40 },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                axis: { title: null, format: "%b %d", tickCount: 6 },
                scale: { padding: 10 },
              },
              y: {
                field: "value",
                type: "quantitative",
                axis: { title: null, tickCount: 4 },
              },
              color: { value: "#FF6600" },
              tooltip: [
                { field: "date", type: "temporal" },
                { field: "valueRaw", title: "Reported", type: "nominal" }, 
              ],
            },
          },
        ],
      },
      {
        // width: "container",
        facet: {
          field: "series",
          title: null,
          type: "nominal",
          columns: 10,
          header: {
            labelAlign: "left",
            labelFontSize: 12,
            labelColor: "#374151",
            labelPadding: 5,
          },
        },
        spec: {
          width: 385,
          height: 100,
          transform: [{ filter: "datum.series !== 'ARI'" }],
          layer: [
            // smaller chart area
            {
              mark: { type: "area", interpolate: "linear", opacity: 0.15 },
              encoding: {
                x: {
                  field: "date",
                  type: "temporal",
                  axis: { title: null, format: "%b %d", tickCount: 6 },
                  scale: { padding: 10 },
                },
                y: { field: "value", type: "quantitative" },
                color:{
                  field: "series",
                  type: "nominal",
                  scale:{
                    domain: ["COVID", "Flu", "RSV"],
                    range: [
                      tokens.colorScales.covid[1],
                      tokens.colorScales.flu[0],
                      tokens.colorScales.rsv[0],
                    ],
                  },
                  legend: null,
                },
              },
            },
            {
              mark: {
                type: "line",
                interpolate: "linear",
                strokeWidth: 3,
                point: { size: 40 },
              },
              encoding: {
                x: {
                  field: "date",
                  type: "temporal",
                  axis: { title: null, format: "%b %d", tickCount: 6 },
                  scale: { padding: 10 },
                },
                y: {
                  field: "value",
                  type: "quantitative",
                  axis: { title: null, tickCount: 4 },
                },
                color: {
                  field: "series",
                  type: "nominal",
                  scale: {
                    domain: ["COVID", "Flu", "RSV"],
                    range: [
                      tokens.colorScales.covid[1],
                      tokens.colorScales.flu[0],
                      tokens.colorScales.rsv[0],
                    ],
                  },
                  legend: null,
                },
                tooltip: [
                  { field: "date", type: "temporal" },
                  { field: "valueRaw", title: "Reported", type: "nominal" }, 
                  { field: "series", type: "nominal" },
                ],                
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div>
      <VegaLite key={view} spec={spec} data={{ table: flattened }} />
      <div style={{ marginTop: "1rem",
                    fontSize: "14px",
                    // color: "#6B7280",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 1rem", }}>
        <div>
          Data as of:{" "}
          {latestWeek ? formatDate(latestWeek) : "N/A"}
        </div>
      </div>
    </div>
  );

};

CombinedVirusChart.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  view: PropTypes.string,
};

export default CombinedVirusChart;