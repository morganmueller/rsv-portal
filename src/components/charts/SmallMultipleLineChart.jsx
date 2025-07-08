import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";

const { colors, typography, spacing } = tokens;
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
}) => {
  const virusColorMap = {
    "COVID-19": colors.bluePrimary,
    "Influenza": colors.purplePrimary,
    "RSV": colors.greenPrimary,
  };

  const virusColorRangeMap = {
    "COVID-19": covid,
    "Influenza": flu,
    "RSV": rsv,
  };

  const defaultColor = colors.gray600;
  const selectedColor =
    tokens.colors[color] || color || virusColorMap[virus] || defaultColor;


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

// establish groups
let groups;
metricName.includes('age') ? groups = ['0-4', '5-17', '18-64', '65+'] : metricName.includes('borough') ? groups = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'] : metricName.includes('race') ? groups = ['Asian/Pacific Islander', "Black/African American", 'White', "Hispanic/Latino"] : console.log('Group error')

const specTemplate = {
  width: "container",
  title: {
    text: title,
    subtitlePadding: 10,
    fontWeight: "normal",
    anchor: "start",
    fontSize: 14,
    baseline: "top",
    dy: -10,
    subtitleFontSize: 13
  },
  config: {
      background: colors.white,
      axis: {
        // labelFont: typography.body,
        // titleFont: typography.heading,
        labelColor: colors.gray700,
        titleColor: colors.gray800,
        labelFontSize: 12
      },
      axisY: {
        domain: false,
        ticks: false,
        tickCount: 2,
        orient: "left",
        zindex: 0,
        gridDash: [2],
      },
      axisX: {
        domain: true,
        grid: false
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
        binSpacing: -5
      }
    },
    vconcat: [{}]

}

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
  width: 975,
  transform: [
    {
      filter: `datum.submetric === '${group}'`
    }
  ],
  layer: [
    {
      mark: { type: "area", opacity: 0.15, color: selectedColor },
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          axis: { title: null, format: "%b %d", tickCount: 6, labelAngle: 0 },
          scale: { padding: 0 }
        },
        y: {
          field: "value",
          type: "quantitative",
          title: null
        }
      }
    },
    {
      mark: { type: "line", point: "true" },
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          axis: { title: null, format: "%b %d", tickCount: 6, labelAngle: 0 },
          scale: { padding: 0 }
        },
        y: {
          field: "value",
          type: "quantitative",
          title: null
        },
        color: { value: selectedColor },
        tooltip: [
          { field: "date", type: "temporal", format: "%d %b %Y" },
          { field: "submetric", type: "nominal" },
          { field: "value", type: "quantitative" }
        ]
      }
    }
  ]
}));


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

export default SmallMultipleLineChart;
