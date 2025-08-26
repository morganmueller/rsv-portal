import React, { useMemo, useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import TrendSubtitle from "../controls/TrendSubtitle";
import { getTrendFromTimeSeries, formatDate } from "../../utils/trendUtils";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";
import ChartModal from "../popups/ChartModal"; // 
import VegaLiteWrapper from "./VegaLiteWrapper";

const CombinedVirusChart = ({ data = {}, view = "visits", footnote, title, columnLabels = {}  }) => {
  if (!data || (!Array.isArray(data) && typeof data !== "object")) return null;

  // --- trend bits for ARI subtitle
  const ariSeries = data["ARI visits"] || data["ARI hospitalizations"] || [];
  const trend = getTrendFromTimeSeries(ariSeries, "value");
  const latestWeek = ariSeries?.at?.(-1)?.date;

  const trendClass =
    trend?.direction === "up" ? "trend-up" :
    trend?.direction === "down" ? "trend-down" : "trend-neutral";

  const fullVars = {
    date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
    trend: trend ? `<span class="${trendClass}">${trend.label} ${trend.value}</span>` : "not changed",
  };

  const rawSubtitleTemplate =
    `<span class="bg-highlight">${(view === "hospitalizations" ? "Hospitalizations" : "Visits")}</span>` +
    " for the week of {date} have {trend} since the previous week";

  const resolvedTitle = title?.replace("{view}", view);
  const subtitle = <TrendSubtitle template={rawSubtitleTemplate} variables={fullVars} />;

  // normalize data once
  const flattened = useMemo(() => {
    const rows = Array.isArray(data)
      ? data
      : Object.entries(data).flatMap(([seriesName, arr]) =>
          (arr || []).map((row) => ({ ...row, series: seriesName }))
        );
    return rows.map((row) => ({
      ...row,
      date: new Date(row.date),
      value: Number.isNaN(+row.value) ? null : +row.value,
      valueRaw: row.value,
      series: (row.series || "")
        .replace(" visits", "")
        .replace(" hospitalizations", "")
        .replace("COVID-19", "COVID")
        .replace("Influenza", "Flu"),
    }));
  }, [data]);

  const ARI_COLOR = tokens.colors?.orangePrimary ?? "#FF6600";
  const seriesDomain = ["COVID", "Flu", "RSV"];
  const miniSeries = ["COVID", "Flu", "RSV"];
  const seriesRange = [
    tokens.colorScales.covid[1],
    tokens.colorScales.flu[0],
    tokens.colorScales.rsv[0],
  ];

  const valueTooltipField = {
    field: "valueDisplay",
    type: "nominal",
    title: columnLabels.value || "Emergency Department visits",
  };

  // ---------- COMMON Y DOMAIN for bottom charts ----------
  const miniYDomain = useMemo(() => {
    const vals = flattened
      .filter(d => miniSeries.includes(d.series) && typeof d.value === "number" && Number.isFinite(d.value))
      .map(d => d.value);
    if (vals.length === 0) return undefined;
    // lock to nice rounded bounds (optional)
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    // pad a bit so lines don't hug the top/bottom
    const pad = (max - min) * 0.05 || 1;
    return [Math.max(0, Math.floor((min - pad) * 10) / 10), Math.ceil((max + pad) * 10) / 10];
  }, [flattened]);

  /** ---------- Main ARI chart ---------- */
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
      axisY: {
        domain: false, ticks: false, tickCount: 3, orient: "left", gridDash: [2],
        format: ".1f", labelExpr: "datum.label + '%'"
      },
      view: { stroke: "transparent" },
    },
    title: {
      text: resolvedTitle,
      //subtitle: subtitle ? undefined : null,
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
      { calculate: "month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1", as: "startYear" },
      {
        calculate:
          "(datetime(year(datum.date), month(datum.date), date(datum.date))" +
          " - datetime(month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1, 8, 1))" +
          " / (1000 * 60 * 60 * 24) + 1",
        as: "dayOfSeason",
      },
      {
        calculate:
          "datum.valueRaw != null ? " +
          "  (test(/%$/, '' + datum.valueRaw) ? '' + datum.valueRaw : ('' + datum.valueRaw) + '%') " +
          "  : (isValid(datum.value) ? format(datum.value, '.1f') + '%' : 'N/A')",
        as: "valueDisplay"
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
          tooltip: [{ field: "date", type: "temporal", format: "%d %b %Y", title: "Date" }, valueTooltipField],
        },
      },
      {
        mark: { type: "point", size: 300, opacity: 0.001 },
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "value", type: "quantitative" },
          color: { value: ARI_COLOR },
          tooltip: [{ field: "date", type: "temporal", format: "%d %b %Y",title: "Date" }, valueTooltipField],
        },
      },
    ],
  };

  /** ---------- Reusable spec builder for mini + modal charts ---------- */
  const baseSmallConfig = {
    width: "container",
    autosize: { type: "fit", contains: "padding", resize: true },
    config: ariTopSpec.config,
  };

  const buildSeriesSpec = (series, { tall = false, showYAxis = true, yDomain } = {}) => ({
    ...baseSmallConfig,
    height: tall ? 280 : 120,
    transform: [
      { filter: `datum.series === '${series}'` },
      {
        calculate:
          "datum.valueRaw != null ? " +
          "  (test(/%$/, '' + datum.valueRaw) ? '' + datum.valueRaw : ('' + datum.valueRaw) + '%') " +
          "  : (isValid(datum.value) ? format(datum.value, '.1f') + '%' : 'N/A')",
        as: "valueDisplay"
      }
    ],
    layer: [
      {
        mark: { type: "area", interpolate: "linear", opacity: 0.15 },
        encoding: {
          x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: tall ? 8 : 6 }, scale: { padding: 10 } },
          y: {
            field: "value", type: "quantitative",
            axis: showYAxis
              ? { title: null, tickCount: tall ? 6 : 4, format: ".1f", labelExpr: "datum.label + '%'" }
              : { title: null, labels: false, ticks: false, domain: false, grid: true },
            scale: yDomain ? { domain: yDomain } : undefined
          },
          color: {
            field: "series", type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange }, legend: null,
          },
        },
      },
      {
        mark: { type: "line", interpolate: "linear", strokeWidth: tall ? 3 : 2, point: { size: tall ? 60 : 40 } },
        encoding: {
          x: { field: "date", type: "temporal", axis: { title: null, format: "%b %d", tickCount: tall ? 8 : 6 }, scale: { padding: 10 } },
          y: {
            field: "value", type: "quantitative",
            axis: showYAxis
              ? { title: null, tickCount: tall ? 6 : 4, format: ".1f", labelExpr: "datum.label + '%'" }
              : { title: null, labels: false, ticks: false, domain: false, grid: false },
            scale: yDomain ? { domain: yDomain } : undefined
          },
          color: {
            field: "series", type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange }, legend: null,
          },
          tooltip: [
            { field: "date", type: "temporal", format: "%d %b %Y", title: "Date" },
            valueTooltipField,
            { field: "series", type: "nominal" },
          ],
        },
      },
      {
        mark: { type: "point", size: 300, opacity: 0.001 },
        encoding: {
          x: { field: "date", type: "temporal" },
          y: {
            field: "value", type: "quantitative",
            scale: yDomain ? { domain: yDomain } : undefined
          },
          color: {
            field: "series", type: "nominal",
            scale: { domain: seriesDomain, range: seriesRange }, legend: null,
          },
          tooltip: [
            { field: "date", type: "temporal", format: "%d %b %Y", title: "Date" },
            valueTooltipField,
            { field: "series", type: "nominal" },
          ],
        },
      },
    ],
  });

  /** ---------- Modal state ---------- */
  const [modalSeries, setModalSeries] = useState(null);
  const openModal = (series) => setModalSeries(series);
  const closeModal = () => setModalSeries(null);

  const seriesLabels = {
    COVID: view === "hospitalizations" ? "COVID-19 Hospitalizations" : "COVID-19 Visits",
    Flu: view === "hospitalizations" ? "Influenza Hospitalizations" : "Influenza Visits",
    RSV: view === "hospitalizations" ? "RSV Hospitalizations" : "RSV Visits",
  };

  return (
    <div className="combined-virus-chart">

      {/* ARI overview */}
      <VegaLiteWrapper data={flattened} specTemplate={ariTopSpec} rendererMode="svg" />

      {/* Three mini charts with shared y-scale; y-axis only on leftmost */}
      <div
        className="mini-series-row"
        style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:"12px", marginTop:"12px" }}
      >
        {miniSeries.map((series, idx) => (
          <button
            key={series}
            type="button"
            className="mini-series-card"
            onClick={() => openModal(series)}
            aria-label={`Open large ${seriesLabels[series]} chart`}
            style={{
              display:"flex", flexDirection:"column", gap:6, padding:"8px 8px 4px 8px",
        background:"#fff",
              cursor:"pointer", textAlign:"left", boxShadow:"0 1px 2px rgba(0,0,0,0.06)"
            }}
          >
            <div style={{ fontSize:13, fontWeight:600, color:"#374151", padding:"0 2px" }}>
              {seriesLabels[series]}
            </div>
            <div style={{ width:"100%" }}>
              <VegaLiteWrapper
                data={flattened}
                specTemplate={buildSeriesSpec(series, {
                  tall: false,
                  showYAxis: idx === 0,       // only on the leftmost mini
                  yDomain: miniYDomain        // shared y-domain
                })}
                rendererMode="svg"
              />
            </div>
            <div style={{ fontSize:12, color:"#6b7280", padding:"0 2px 4px 2px" }}>
              Tap/click to enlarge
            </div>
          </button>
        ))}
      </div>

      <ChartFooter latestDate={latestWeek ? formatDate(latestWeek) : "N/A"} footnote={footnote} />

      {/* Modal for enlarged chart (uses same domain for consistency) */}
      <ChartModal
        title={modalSeries ? seriesLabels[modalSeries] : ""}
        isOpen={!!modalSeries}
        onClose={closeModal}
      >
        {modalSeries && (
          <div style={{ padding: "8px 4px 4px 4px" }}>
            <VegaLiteWrapper
              data={flattened}
              specTemplate={buildSeriesSpec(modalSeries, {
                tall: true,
                showYAxis: true,
                yDomain: miniYDomain
              })}
              rendererMode="svg"
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              Press Esc or click outside to close.
            </div>
          </div>
        )}
      </ChartModal>
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
