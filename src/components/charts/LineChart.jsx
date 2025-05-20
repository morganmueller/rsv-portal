import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
const { covid, flu, rsv } = tokens.colorScales;


/**
 * Infer appropriate time format for x-axis labels based on temporal resolution.
 */
const getXAxisFormat = (data, xField) => {
  if (!data || data.length < 2) return "%b %d";

  const first = new Date(data[0][xField]);
  const second = new Date(data[1][xField]);
  const delta = Math.abs(second - first);

  const oneDay = 86400000;
  const oneWeek = oneDay * 7;
  const oneMonth = oneDay * 28;

  if (delta <= oneDay) return "%b %d";
  if (delta <= oneWeek + oneDay) return "%b %d";
  if (delta <= oneMonth) return "%b";
  return "%b %Y";
};

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
    "COVID-19": covid,
    "Influenza": flu,
    "RSV": rsv,
  };

  const defaultColor = colors.gray600;
  const selectedColor =
    tokens.colors[color] || color || virusColorMap[virus] || defaultColor;

  const filteredData =
    virus && data.some((d) => d.virus)
      ? data.filter((d) => d.virus === virus)
      : data;

      console.log("FILTERED DATA", filteredData);

  // ✅ Parse date field to real Date objects
  const parsedData = filteredData.map((d) => ({
    ...d,
    [xField]: new Date(d[xField])
  }));

  // 🔍 👇 DEBUG AGE GROUPS / SUBMETRICS
const groupCounts = {};
parsedData.forEach(d => {
  const g = d.submetric;
  groupCounts[g] = (groupCounts[g] || 0) + 1;
});
console.log("AGE GROUPS IN CHART DATA:", groupCounts);

  const axisFormat = getXAxisFormat(parsedData, xField);

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
        symbolStrokeWidth: 5,
      },
      view: {
        stroke: "transparent",
      },
    },
    layer: [
      ...(colorField
        ? [] // no area layer for multiseries
        : [
            {
              mark: {
                type: "area",
                interpolate: "monotone",
                opacity: 0.15,
                color: selectedColor,
              },
              encoding: {
                x: {
                  field: "{xField}",
                  type: "temporal",
                  axis: {
                    title: null,
                    format: axisFormat,
                    tickCount: 6,
                  },
                  scale: { padding: 10 },
                },
                y: {
                  field: "{yField}",
                  type: "quantitative",
                  axis: { title: null, tickCount: 4 },
                },
              },
            },
          ]),
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
            axis: {
              title: null,
              format: axisFormat,
              tickCount: 6,
            },
            scale: { padding: 10 },
          },
          y: {
            field: "{yField}",
            type: "quantitative",
            axis: { title: null, tickCount: 4 },
          },
          color: colorField
            ? {
                field: "{colorField}",
                type: "nominal",
                scale: {
                  range: virusColorRangeMap[virus] || undefined,
                },
              }
            : { value: selectedColor },
          tooltip: tooltipFields?.map((field) => {
            const sample = parsedData[0]?.[field];
            const type =
              field === xField
                ? "temporal"
                : typeof sample === "number"
                ? "quantitative"
                : "nominal";
            return { field, type };
          }),
        },
      },
    ],
  };

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper
        data={parsedData}
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
