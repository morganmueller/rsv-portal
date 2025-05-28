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

const SmallMultipleBarChart = ({
  data,
  xField = "date",
  yField = "value",
  colorField = "submetric",
  metricName,
  display,
  legendTitle = "Category",
  showRollingAvg = false,
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

// Set color values by metricName
let colorValue
if (metricName.includes('COVID')) {
  colorValue = '#2B83BA'
} else if (metricName.includes('Influenza') || metricName.includes('Flu') || metricName.includes('flu')) {
  colorValue = '#4F32B3'
} else if (metricName.includes('RSV')) {
  colorValue = '#00441B'
} else {
  console.log('metric name not identified')
}

const specTemplate = {
  width: "container",
  autosize: { type: "fit", contains: "padding" },
  transform: [
    {
      calculate: "datum.submetric === '0-4' ? 0 : datum.submetric === '5-17' ? 1 : datum.submetric === '18-49' ? 2 : datum.submetric === '50-64' ? 3 : 4",
      as: "submetric_order"
    }
  ],
  facet: {
    row: {
      field: "submetric",
      type: "nominal",
      sort: { field: "submetric_order", op: "min" },
      header: {
        labelOpacity: 0,
        labelFontSize: 0,
        title: null,
        labelPadding: 0
      }
    }
  },
  spec: {
    height: 75,
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
      bar: { binSpacing: 0, stroke: null, continuousBandSize: 10 }
    },
    layer: [
      {
        transform: [
          {
            window: [{ op: "row_number", as: "row_number" }],
            groupby: ["submetric"]
          },
          { filter: "datum.row_number === 1" }
        ],
        mark: {
          type: "text",
          align: "left",
          dx: -518,
          dy: -50,
          font: typography.body,
          fontSize: 14,
          fontWeight: "bold",
          color: "#374151"
        },
        encoding: {
          text: { field: "submetric", type: "nominal" }
        }
      },
      {  
        selection: {
          hover: {
          type: "single",
          on: "mouseover",
          empty: "none",
          fields: ["date", "submetric"]
            }
          } ,
        mark: { type: "bar", opacity: 0.9, stroke: 1 },
        encoding: {
          x: {
            field: xField,
            type: "ordinal",
            axis: {
              title: null,
              labelExpr: "timeFormat(toDate(datum.value), '%m/%d/%y')",
              labelAngle: -45
            },
            scale: { padding: 0 }
          },
          y: {
            field: yField,
            type: "quantitative",
            stack: "zero",
            title: null
          },
          color: {
            value: colorValue
          },
          strokeWidth: {
              condition: {
                selection: "hover",
                value: 2.5
              },
              value: 1  // no visible stroke when not hovered
            },
          order: { field: "stackOrder", type: "ordinal" },
          tooltip: [
            { field: "date", type: "temporal", format: "%d %b %Y" },
            { field: "submetric", type: "nominal" },
            { field: "value", type: "quantitative" }
          ]
        }
      }
    ]
  }
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

export default SmallMultipleBarChart;