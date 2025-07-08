import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";

const { covid, flu, rsv } = tokens.colorScales;
const { colors, typography } = tokens;

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
  title,
  xField,
  yField,
  colorField,
  tooltipFields,
  virus,
  color,
  metricName = "Category",
  isPercent,
  seasonal,
  dataSource = "NYC Health Department Syndromic Surveillance",
  footnote,
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

  const filteredData =
    virus && data.some((d) => d.virus)
      ? data.filter((d) => d.virus === virus)
      : data;

  const axisFormat = getXAxisFormat(filteredData, xField);

  const xEncoding = seasonal
    ? {
        field: "dayOfSeason",
        type: "quantitative",
        axis: {
          title: null,
          values: [1, 32, 62, 93, 124, 152, 183, 213, 244, 274, 305, 335],
          labelExpr:
            "['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][indexof([1, 32, 62, 93, 124, 152, 183, 213, 244, 274, 305, 335], datum.value)]",
        },
        scale: { domain: [1, 365] },
      }
    : {
        field: xField,
        type: "temporal",
        axis: {
          title: null,
          format: axisFormat,
          tickCount: 6,
        },
        scale: { padding: 10 },
      };

  const sharedTooltip = (tooltipFields ?? [xField, yField, ...(colorField ? [colorField] : [])]).map(
    (field) => {
      const sample = filteredData.find((d) => d[field] != null)?.[field];
      return {
        field,
        type:
          field === xField
            ? "temporal"
            : typeof sample === "number"
            ? "quantitative"
            : "nominal",
      };
    }
  );

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
      subtitleFontSize: 13
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
        zindex: 0,
        gridDash: [2],
      },
      legend: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: colors.gray600,
        titleColor: colors.gray700,
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
        title: metricName,
        labelFontSize: 16,
      },
      view: {
        stroke: "transparent",
      },
    },
    transform: [
      { calculate: "year(datum.date)", as: "year" },
      { calculate: "month(datum.date)", as: "month" },
      { calculate: "dayofyear(datum.date)", as: "day" },
      {
        calculate: "month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1",
        as: "startYear",
      },
      {
        calculate:
          "(datetime(year(datum.date), month(datum.date), date(datum.date)) - datetime(month(datum.date) > 7 ? year(datum.date) : year(datum.date) - 1, 8, 1)) / (1000 * 60 * 60 * 24) + 1",
        as: "dayOfSeason",
      },
      {
        calculate: "toString(datum.startYear) + '-' + substring(toString(datum.startYear + 1), 2)",
        as: "season"
      }
    ],
    layer: [
      ...(colorField || seasonal
        ? []
        : [
            {
              mark: {
                type: "area",
                interpolate: "linear",
                opacity: 0.15,
                color: selectedColor,
              },
              encoding: {
                x: xEncoding,
                y: { field: "{yField}", type: "quantitative" },
              },
            },
          ]),
      {
        mark: {
          type: "line",
          interpolate: "linear",
          strokeWidth: 3,
          point: { filled: true, size: 40 },
        },
        encoding: {
          x: xEncoding,
          y: {
            field: "{yField}",
            type: "quantitative",
            axis: {
              title: null,
              tickCount: 4,
              ...(isPercent ? { labelExpr: "datum.value + '%'" } : {}),
            },
          },
          color: colorField
            ? {
                field: "{colorField}",
                type: "nominal",
                scale: { range: virusColorRangeMap[virus] || undefined },
                sort: ["0-4", "5-17", "18-64", "65+"],
              }
            : { value: selectedColor },
          tooltip: sharedTooltip,
        },
      },
      {
        mark: {
          type: "point",
          opacity: 0,
          size: 100,
        },
        encoding: {
          x: xEncoding,
          y: { field: "{yField}", type: "quantitative" },
          tooltip: sharedTooltip,
        },
      },
    ],
  };

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper
        data={filteredData}
        specTemplate={specTemplate}
        dynamicFields={{ xField, yField, colorField }}
      />
      <ChartFooter
        dataSource={dataSource}
        latestDate={
          filteredData?.length > 0 ? Math.max(...filteredData.map((d) => new Date(d[xField]))) : null
        }
        footnote={footnote}
      />
    </div>
  );
};

export default LineChart;
