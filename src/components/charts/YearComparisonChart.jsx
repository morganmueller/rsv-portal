// YearComparisonChart.jsx
import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";

const { colors, typography } = tokens;

function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

const useMedia = (query) => {
  const get = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia !== "undefined" &&
    window.matchMedia(query).matches;

  const [matches, setMatches] = React.useState(get);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    setMatches(mql.matches);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
};

const YearComparisonChart = ({
  data,
  xField = "date",
  yField = "value",
  colorField = "submetric",
  metricName,
  title,
  display,
  legendTitle,
  showRollingAvg = false,
  customColorScale,
  dataSource,
  footnote,
  columnLabels = {}
}) => {
  const normalizedDisplay =
    typeof display === "string" ? display.trim().toLowerCase() : null;

  // Use palette arrays (ramps), not single primaries
  const palettesByMetric = {
    "COVID-19": tokens.colorScales.covid,
    Flu: tokens.colorScales.flu,
    RSV: tokens.colorScales.rsv,
    ARI: tokens.colorScales.ari,
  };
  const defaultRange = Array.isArray(palettesByMetric?.[metricName])
    ? palettesByMetric[metricName]
    : tokens.colorScales.covid;

  const parsed = (Array.isArray(data) ? data : []).map((d) => {
    const dateObj = new Date(d.date);
    const year = dateObj.getFullYear();
    const week = getISOWeek(dateObj);
    const rawDisplay = typeof d.display === "string" ? d.display.trim() : "";
    const normalizedRowDisplay = rawDisplay.toLowerCase();
    const numeric = Number(d[yField]);
    const valueNum = Number.isFinite(numeric) ? numeric : null;

    return {
      ...d,
      date: dateObj,
      year,
      isoWeek: `${year}-W${String(week).padStart(2, "0")}`,
      valueRaw: d[yField], // tooltip
      value: valueNum,     // plot
      metric: d.metric ?? metricName,
      [colorField]: d[colorField] ?? "Unknown",
      display: normalizedRowDisplay || "unknown",
    };
  });

  const isMobile = useMedia("(max-width: 770px)");
  const legendColumns = isMobile ? 2 : undefined;

  const filtered = parsed.filter((d) => {
    const isMatch = !metricName || d.metric === metricName;
    const isDisplayMatch = !normalizedDisplay || d.display === normalizedDisplay;
    return isMatch && isDisplayMatch;
  });

  // Recommended: lock a stable domain so colors don't shuffle if a category is missing
  // Adjust this array to the exact set/order used in your data
  const fixedDomain = [
    "Flu B",
    "Confirmed",
    "Flu A H3",
    "Probable",
    "Flu A H1",
    "Flu A not subtyped",
    "Unknown",
  ];
  const colorDomain = fixedDomain.filter((k) =>
    filtered.some((d) => d[colorField] === k)
  );

  const baseBarLayer = {
    mark: { type: "bar", opacity: 0.9, stroke: null },
    encoding: {
      x: {
        field: xField,
        type: "temporal",
        axis: { title: null, format: "%b %d", tickCount: 12, labelAngle: 0 },
      },
      y: {
        field: "value",
        type: "quantitative",
        title: null,
        stack: "zero",
      },
      ...(colorField && {
        color: {
          field: colorField,
          type: "nominal",
          legend: { title: null }, 
          scale: customColorScale
            ? customColorScale
            : { domain: colorDomain.length ? colorDomain : undefined, range: defaultRange },
        },
        // Stable stack order using numeric stackOrder we compute in transform
        order: { field: "stackOrder", type: "quantitative", sort: "ascending" },
      }),
      tooltip: [
        { field: "date", type: "temporal", format: "%b, %d, %Y", title: columnLabels.date || "Date" },
        ...(colorField
          ? [{ field: colorField, type: "nominal", title: columnLabels[colorField] || legendTitle }]
          : []),
        { field: "value", type: "quantitative", title: columnLabels.value || "Value" },
      ],
    },
  };

  const rollingAvgLayer = showRollingAvg
    ? {
        transform: [
          { aggregate: [{ op: "sum", field: "value", as: "totalValue" }], groupby: [xField] },
          {
            window: [{ op: "mean", field: "totalValue", as: "rollingAvg" }],
            frame: [-1, 1],
            sort: [{ field: xField, order: "ascending" }],
          },
        ],
        mark: {
          type: "line",
          color: colors.gray700,
          strokeWidth: 2,
          interpolate: "monotone",
        },
        encoding: {
          x: { field: xField, type: "temporal" },
          y: { field: "rollingAvg", type: "quantitative", title: "3-Week Avg" },
          tooltip: [
            { field: xField, type: "temporal", format: "%b, %d, %Y", title: columnLabels[xField] || "Date" },
            { field: "rollingAvg", type: "quantitative", title: "3-Week Avg" },
          ],
        },
      }
    : null;

  const specTemplate = {
    width: "container",
    autosize: { type: "fit", contains: "padding" },
    title: {
      text: title,
      subtitlePadding: 10,
      fontWeight: "normal",
      anchor: "start",
      fontSize: 14,
      baseline: "top",
      dy: -10,
      subtitleFontSize: 13,
    },
    config: {
      background: colors.white,
      axis: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray700,
        titleColor: colors.gray800,
        labelFontSize: 12,
      },
      axisX: { ticks: true, domain: true, grid: false },
      axisY: { domain: false, ticks: false, tickCount: 3, orient: "left", zindex: 0, gridDash: [2] },
      view: { stroke: "transparent" },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
        labelFontSize: 16,
        direction: "horizontal",
        columns: legendColumns,
        columnPadding: 30,
        labelLimit: isMobile ? 160 : 300,
      },
      bar: {
        binSpacing: 0,
        stroke: null,
        continuousBandSize: 20,
      },
    },
    transform: [
      {
        calculate: `
          datum['${colorField}'] === 'Flu B' ? 0 :
          datum['${colorField}'] === 'Confirmed' ? 0 :
          datum['${colorField}'] === 'Flu A H3' ? 1 :
          datum['${colorField}'] === 'Probable' ? 1 :
          datum['${colorField}'] === 'Flu A H1' ? 2 :
          datum['${colorField}'] === 'Flu A not subtyped' ? 3 : 4
        `,
        as: "stackOrder",
      },
    ],
    layer: showRollingAvg ? [baseBarLayer, rollingAvgLayer] : [baseBarLayer],
  };

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <VegaLiteWrapper data={filtered} specTemplate={specTemplate} />
      <ChartFooter dataSource={dataSource} footnote={footnote} />
    </div>
  );
};

export default YearComparisonChart;
