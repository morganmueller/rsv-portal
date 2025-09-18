import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";

const { colors, typography } = tokens;
const { covid, flu, rsv } = tokens.colorScales;

function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

const SmallMultipleLineChart = ({
  data,
  xField = "date",
  yField = "value",
  colorField = "submetric",
  virus,
  color,
  title,
  metricName,
  display,
  legendTitle = "Category",
  showRollingAvg = false,
  groupedAges,
  monthly,
  dataSource,
  footnote,
  sharedY = false,
  columnLabels = {}
}) => {
  const virusColorMap = {
    "COVID-19": colors.bluePrimary,
    "Flu": colors.purplePrimary,
    "RSV": colors.greenPrimary,
  };

  // Map display label → source label used in data
  const toSourceVirus = (v) => (v === "Flu" ? "Influenza" : v);
  const sourceVirus = toSourceVirus(virus);

  const filteredData =
   virus && Array.isArray(data) && data.some((d) => d.virus === sourceVirus)
   ? data.filter((d) => d.virus === sourceVirus)
   : Array.isArray(data) ? data : [];

  const explicitTokenColor =
    color && tokens.colors?.[color] ? tokens.colors[color] : null;

  const selectedColor =
    explicitTokenColor ||
    (virus && virusColorMap[virus]) ||
    (metricName?.includes("COVID")
      ? colors.bluePrimary
      : metricName?.match(/Influenza|Flu/i)
      ? colors.purplePrimary
      : metricName?.includes("RSV")
      ? colors.greenPrimary
      : colors.gray600);

  const normalizedDisplay =
    typeof display === "string" ? display.trim().toLowerCase() : null;

  const parsed = filteredData.map((d) => {
    const dateObj = new Date(d[xField] ?? d.date);
    const year = dateObj.getFullYear();
    const week = getISOWeek(dateObj);
    const rawDisplay = typeof d.display === "string" ? d.display.trim() : "";
    const normalizedRowDisplay = rawDisplay.toLowerCase();
    const numeric = Number(d[yField] ?? d.value);
    const valueNum = Number.isFinite(numeric) ? numeric : null;

    return {
      ...d,
      date: dateObj,
      year,
      isoWeek: `${year}-W${String(week).padStart(2, "0")}`,
      value: valueNum,
      valueRaw: d.valueRaw ?? d[yField] ?? d.value,
      metric: d.metric ?? metricName,
      [colorField]: d[colorField] ?? "Unknown",
      display: normalizedRowDisplay || "unknown",
    };
  });

  const filtered = parsed.filter((d) => {
    const isMatch = !metricName || d.metric === metricName;
    const isDisplayMatch = !normalizedDisplay || d.display === normalizedDisplay;
    return isMatch && isDisplayMatch;
  });

  let groups;
  if (metricName?.includes("age") && !groupedAges) {
    groups = ["0-4", "5-17", "18-64", "65+"];
  } else if (metricName?.includes("age") && groupedAges) {
    groups = ["0-17", "18-64", "65+"];
  } else if (metricName?.includes("borough")) {
    groups = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
  } else if (metricName?.includes("race")) {
    groups = ["Asian/Pacific Islander", "Black/African American", "White", "Hispanic/Latino"];
  } else {
    const set = new Set(filtered.map((d) => d[colorField]).filter(Boolean));
    groups = Array.from(set);
  }

  if (!groups || groups.length === 0) {
    return (
      <div style={{ width: "100%", minWidth: 0 }}>
        <div style={{ padding: "1rem", color: colors.gray600 }}>No data to display.</div>
        <ChartFooter dataSource={dataSource} footnote={footnote} />
      </div>
    );
  }

  const dateFormat = monthly ? "%b" : "%b %d";

  const specTemplate = {
    width: "container",
    autosize: { type: "fit", contains: "padding", resize: true },
    title: {
      text: title,
      subtitlePadding: 10,
      fontWeight: "normal",
      anchor: "start",
      fontSize: 14,
      baseline: "top",
      dy: -10
    },
    config: {
      background: colors.white,
      axis: {
        labelColor: colors.gray700,
        titleColor: colors.gray800,
        labelFontSize: 12
      },
      axisY: { domain: false, ticks: false, tickCount: 2, orient: "left", zindex: 0, gridDash: [2] },
      axisX: { domain: true, grid: false },
      view: { stroke: "transparent" },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
        title: legendTitle
      }
    },
    ...(sharedY ? { resolve: { scale: { y: "shared" } } } : {}),
    vconcat: []
  };

  const valueTooltipField =
    filtered.some((d) => d.valueRaw != null)
      ? { field: "valueRaw", title: columnLabels.value || "Reported" }
      : { field: "value", title: columnLabels.value || "Reported" };

  specTemplate.vconcat = groups.map((group) => ({
    title: {
      text: group,
      anchor: "start",
      align: "left",
      fontSize: 14,
      fontWeight: "bold",
      color: "#374151"
    },
    height: 75,
    width: "{containerWidth}",
    transform: [{ filter: `datum['${colorField}'] === '${group}'` }],
    encoding: {
      x: { field: "date", type: "temporal", axis: { title: null, format: dateFormat, tickCount: 6, labelAngle: 0 } },
      y: { field: "value", type: "quantitative", title: null }
    },
    layer: [
      { mark: { type: "area", opacity: 0.15, color: selectedColor } },
      {
        mark: { type: "line", point: { filled: true, size: 40 }, strokeWidth: 2 },
        encoding: {
          color: { value: selectedColor },
          tooltip: [
            { field: "date", type: "temporal", format: "%b, %d, %Y", title: "Date" },
            { field: colorField, type: "nominal", title: columnLabels[colorField] || "Group" },
            valueTooltipField
          ]
        }
      },
      {
        mark: { type: "point", size: 300, opacity: 0.001 }, 
        encoding: {
          color: { value: selectedColor },
          tooltip: [
            { field: "date", type: "temporal", format: "%b, %d, %Y", title: "Date" },
            { field: colorField, type: "nominal", title: columnLabels[colorField] || "Group" },
            valueTooltipField
          ]
        }
      }
    ]
  }));

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <VegaLiteWrapper
        data={filtered}
        specTemplate={specTemplate}
        rendererMode="svg"               
      />
      <ChartFooter
        latestDate={
          filteredData?.length > 0
            ? Math.max(...filteredData.map((d) => new Date(d["date"])))
            : null
        }
        footnote={footnote}
      />
    </div>
  );
};

export default SmallMultipleLineChart;