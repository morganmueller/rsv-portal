import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";

const { colors, typography, spacing } = tokens;

function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

const YearComparisonChart = ({
  data,
  xField = "date",
  yField = "value",
  colorField = "submetric",
  metricName,
  display,
  legendTitle = "Category",
  showRollingAvg = false,
  customColorScale,
}) => {
  const normalizedDisplay =
    typeof display === "string" ? display.trim().toLowerCase() : null;

  const parsed = data.map((d) => {
    const dateObj = new Date(d.date);
    const year = dateObj.getFullYear();
    const week = getISOWeek(dateObj);
    const rawDisplay =
      typeof d.display === "string" ? d.display.trim() : "";
    const normalizedRowDisplay = rawDisplay.toLowerCase();

    return {
      ...d,
      date: dateObj,
      year,
      isoWeek: `${year}-W${String(week).padStart(2, "0")}`,
      value: isNaN(+d[yField]) ? null : +d[yField],
      metric: d.metric ?? metricName,
      ...(colorField ? { [colorField]: d[colorField] ?? "Unknown" } : {}),
      display: normalizedRowDisplay || "unknown",
    };
  });

  const filtered = parsed.filter((d) => {
    const isMatch = !metricName || d.metric === metricName;
    const isDisplayMatch =
      !normalizedDisplay || d.display === normalizedDisplay;
    return isMatch && isDisplayMatch;
  });

  const baseBarLayer = {
    mark: {
      type: "bar",
      opacity: 0.9,
      stroke: null,
    },
    encoding: {
      x: {
        field: xField,
        type: "ordinal",
        axis: {
          title: null,
          labelExpr: "timeFormat(toDate(datum.value), '%m/%d/%y')",
          labelAngle: -45,
        },
        scale: { padding: 0 },
      },
      y: {
        field: yField,
        type: "quantitative",
        stack: "zero",
        title: null,
      },
      ...(colorField && {
        color: {
          field: colorField,
          type: "nominal",
          legend: { title: legendTitle },
          ...(customColorScale ? { scale: customColorScale } : {}),
        },
        order: {
          field: "stackOrder",
          type: "ordinal"
      },
      }),
      tooltip: [
        { field: "date", type: "temporal", format: "%d %b %Y" },
        ...(colorField
          ? [{ field: colorField, type: "nominal" }]
          : []),
        { field: yField, type: "quantitative" },
      ],
    },
  };

  const rollingAvgLayer = showRollingAvg
    ? {
        transform: [
          {
            aggregate: [{ op: "sum", field: yField, as: "totalValue" }],
            groupby: [xField],
          },
          {
            window: [
              { op: "mean", field: "totalValue", as: "rollingAvg" },
            ],
            frame: [-1, 1],
            sort: [{ field: xField }],
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
          y: {
            field: "rollingAvg",
            type: "quantitative",
            title: "3-Week Avg",
          },
          tooltip: [
            { field: xField, type: "temporal", format: "%d %b %Y" },
            {
              field: "rollingAvg",
              type: "quantitative",
              title: "3-Week Avg",
            },
          ],
        },
      }
    : null;

  const specTemplate = {
    width: "container",
    autosize: { type: "fit", contains: "padding" },
    config: {
      background: colors.white,
      axis: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray700,
        titleColor: colors.gray800,
        grid: false,
        ticks: false,
        domain: false,
      },
      view: { stroke: "transparent" },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
      },
      bar: {
        binSpacing: 0,
        stroke: null,
        continuousBandSize: 10,
      },
    },
    transform: [
        {
          calculate: "datum.submetric === 'Flu B' ? 0 : datum.submetric === 'Confirmed' ? 0 : datum.submetric === 'Flu A H3' ? 1 : datum.submetric === 'Probable' ? 1 : datum.submetric === 'Flu A H1' ? 2 : datum.submetric === 'Flu A not subtyped' ? 3 : 4",
          as: "stackOrder"
        }
      ],
    layer: showRollingAvg
      ? [baseBarLayer, rollingAvgLayer]
      : [baseBarLayer],
  };

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper data={filtered} specTemplate={specTemplate} />
      <div
        style={{
          fontSize: typography.fontSizeBase,
          color: colors.gray500,
          marginTop: spacing.sm,
        }}
      >
        Source: NYC Health Department Syndromic Surveillance
      </div>
    </div>
  );
};

export default YearComparisonChart;