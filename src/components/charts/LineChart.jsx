import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
const { covid, flu, rsv } = tokens.colorScales;



const LineChart = ({
  data,
  xField,
  yField,
  colorField,
  tooltipFields,
  virus,
  color,
}) => {
  const { colors, typography, spacing } = tokens;

  const virusColorMap = {
    "COVID-19": colors.bluePrimary,
    "Influenza": colors.purplePrimary,
    "RSV": colors.greenPrimary,
  };

  const virusColorRangeMap = {
    "COVID-19": tokens.colorScales.covid,
    "Influenza": tokens.colorScales.flu,
    "RSV": tokens.colorScales.rsv,
  };

  const defaultColor = colors.gray600;
  const selectedColor = color || virusColorMap[virus] || defaultColor;

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
        tickColor: colors.gray300,
      },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 2,
      },
      view: {
        stroke: "transparent",
      },
    },
    layer: [
      ...(colorField
        ? [] // no area if multiple lines
        : [{
            mark: {
              type: "area",
              interpolate: "monotone",
              opacity: 0.15,
              color: selectedColor
            },
            encoding: {
              x: {
                field: "{xField}",
                type: "temporal",
                axis: { title: null },
                scale: { padding: 10 },
              },
              y: {
                field: "{yField}",
                type: "quantitative",
                axis: {
                  title: null,
                  tickCount: 4,
                },
              }
            }
          }]
      ),
      {
        mark: {
          type: "line",
          point: true,
          interpolate: "monotone",
          strokeWidth: 3,
        },
        encoding: {
          x: {
            field: "{xField}",
            type: "temporal",
            axis: { title: null },
            scale: { padding: 10 },
          },
          y: {
            field: "{yField}",
            type: "quantitative",
            axis: {
              title: null,
              tickCount: 4,
            },
          },
          color: colorField
            ? {
                field: "{colorField}",
                type: "nominal",
                scale: { range: virusColorRangeMap[virus] || viridisCovidColors },
              }
            : { value: selectedColor },
          tooltip: tooltipFields?.map((field) => ({
            field,
            type: field === xField ? "temporal" : "nominal",
          })),
        },
      }
    ],
  };

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper
        data={filteredData}
        specTemplate={specTemplate}
        dynamicFields={{ xField, yField, colorField }}
      />
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

export default LineChart;
