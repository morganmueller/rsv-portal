import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens"; // adjust path if needed

const LineChart = ({
  data,
  xField,
  yField,
  colorField,
  tooltipFields,
  virus,
  color,

}) => {
  const { colors, typography } = tokens;

  const virusColorMap = {
    "COVID-19": colors.bluePrimary,
    "Influenza": colors.purplePrimary,
    "RSV": colors.greenPrimary,
  };

  const virusColorRangeMap = {
    "COVID-19": [colors.bluePrimary, colors.blueSecondary, colors.blueAccent],
    "Influenza": [colors.purplePrimary, colors.purpleAccent, colors.gray600],
    "RSV": [colors.greenPrimary, colors.greenAccent, colors.greenMuted],
  };

  const defaultColor = colors.gray600;
  const selectedColor = color || virusColorMap[virus] || defaultColor;
  const selectedRange = virusColorRangeMap[virus] || [selectedColor];

  // 🔍 Only filter data if virus prop is set and `virus` field exists in data
  const filteredData =
    virus && data.some((d) => d.virus)
      ? data.filter((d) => d.virus === virus)
      : data;

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
        domainColor: colors.gray300,
        tickColor: colors.gray300
      },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 2
      },
      view: {
        stroke: "transparent"
      },
      line: {
        strokeWidth: 3
      },
      point: {
        filled: true,
        fill: selectedColor,
        stroke: colors.white,
        strokeWidth: 1,
        size: 50
      }
    },
    mark: {
      type: "line",
      point: true,
      interpolate: "monotone"
    },
    encoding: {
      x: {
        field: "{xField}",
        type: "temporal",
        axis: { title: null }
      },
      y: {
        field: "{yField}",
        type: "quantitative",
        axis: { title: null }
      },
      color: colorField
        ? {
            field: "{colorField}",
            type: "nominal",
            scale: { range: selectedRange }
          }
        : { value: selectedColor },
      tooltip: tooltipFields?.map((field) => ({
        field,
        type: field === xField ? "temporal" : "nominal"
      }))
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper
        data={filteredData}
        specTemplate={specTemplate}
        dynamicFields={{ xField, yField, colorField }}
      />
    </div>
  );
};

export default LineChart;
