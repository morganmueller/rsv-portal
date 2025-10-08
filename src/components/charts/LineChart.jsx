import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";
import { tokens } from "../../styles/tokens";
import ChartFooter from "./ChartFooter";

const { covid, flu, rsv, ari } = tokens.colorScales;
const { colors, typography } = tokens;

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

const getXAxisFormat = (data, xKey) => {
  if (!data || data.length < 2) return "%b %d";
  const first = new Date(data[0][xKey]);
  const second = new Date(data[1][xKey]);
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
  legend,
  legendTitle,
  color,
  metricName = "Category",
  isPercent = true,
  seasonal,
  dataSource = "NYC Health Department Syndromic Surveillance",
  footnote,
  columnLabels = {},
}) => {
  const virusColorMap = {
    "COVID-19": colors.bluePrimary,
    Flu: colors.purplePrimary,
    RSV: colors.greenPrimary,
    ARI: colors.orangePrimary,
  };

  const virusColorRangeMap = {
    "COVID-19": covid,
    Flu: flu,
    RSV: rsv,
    ARI: ari,
  };

  const isMobile = useMedia("(max-width: 590px)");
  const legendColumns = isMobile ? 2 : undefined;
  const chartBg = getComputedStyle(document.documentElement).getPropertyValue("--chart-bg").trim();
  const chartLabelColor = getComputedStyle(document.documentElement).getPropertyValue("--chart-subtitle-color").trim();
  const chartTitleColor = getComputedStyle(document.documentElement).getPropertyValue("--chart-title-color").trim();

  const defaultColor = colors.gray600;
  const selectedColor = tokens.colors[color] || color || virusColorMap[virus] || defaultColor;

  // Defaults for fields
  const xKey = xField || "date";
  const yKey = yField || "value";

  // Map UI "Flu" -> data "Influenza"
  const toSourceVirus = (v) => (v === "Flu" ? "Influenza" : v);
  const sourceVirus = toSourceVirus(virus);

  // Add display label for legend/tooltips
  const withDisplayLabels = Array.isArray(data)
    ? data.map((d) => ({
        ...d,
        virusDisplay: d.virus === "Influenza" ? "Flu" : d.virus,
      }))
    : [];


  
  const hasVirusField = withDisplayLabels.some((d) => d.virus != null);
  const filteredData =
    virus && hasVirusField
      ? withDisplayLabels.filter((d) => d.virus === sourceVirus)
      : withDisplayLabels;

  const hasValidDate = filteredData.some((d) => {
    const v = d?.[xKey] ?? d?.date;
    const t = v ? new Date(v).getTime() : NaN;
    return Number.isFinite(t);
  });

  const hasFinite = filteredData.some((d) => {
    const raw = d?.[yKey] ?? d?.value;
    if (raw == null) return false;
    // allow "3.2", "3.2%", "+0.5", etc.
    const n = typeof raw === "string" ? parseFloat(raw.replace('%', '')) : raw;
    return Number.isFinite(n);
  });

  if (!hasValidDate || !hasFinite) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ padding: "1rem", color: tokens.colors.gray600 }}>No data to display.</div>
        <ChartFooter dataSource={dataSource} footnote={footnote} />
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map(d => d.value));
  console.log(maxValue)
  const maxPlus = maxValue * 1.25

  const axisFormat = getXAxisFormat(filteredData, xKey);

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
        field: xKey,
        type: "temporal",
        axis: { title: null, format: axisFormat, tickCount: 6 },
        scale: { padding: 10 },
      };

  const valueDisplayCalc = isPercent
    ? "datum.valueRaw != null ? (test(/%$/, '' + datum.valueRaw) ? '' + datum.valueRaw : ('' + datum.valueRaw) + '%') : (isValid(datum.value) ? format(datum.value, '.1f') + '%' : 'N/A')"
    : "datum.valueRaw != null ? '' + datum.valueRaw : (isValid(datum.value) ? format(datum.value, ',.0f') : 'N/A')";

  const sharedTooltip = (tooltipFields ?? [xKey, yKey, ...(colorField ? [colorField] : [])]).map((field) => {
    if (field === yKey) {
      return { field: "valueDisplay", title: columnLabels.value || "Reported", type: "nominal" };
    }
    if (field === xKey || field === "date") {
      return {
        field: field === "date" ? "date" : xKey,
        type: "temporal",
        format: "%b, %d, %Y",
        title: columnLabels[field] || "Date",
      };
    }
    const sample = filteredData.find((d) => d[field] != null)?.[field];
    return { field, type: typeof sample === "number" ? "quantitative" : "nominal", title: columnLabels[field] };
  });

  const lineColorEncoding = colorField
    ? {
        field: "{colorField}",
        type: "nominal",
        scale: {
          range:
            virusColorRangeMap[virus] && colorField === "metric"
              ? [virusColorRangeMap[virus][2], virusColorMap["ARI"]]
              : virusColorRangeMap[virus],
        },
        sort: ["0-4", "5-17", "18-64", "65+"],
        legend:
          legend === null
            ? null
            : {
                labelExpr:
                "datum.label === 'Influenza' ? 'Flu' : datum.label",
                labelLimit: 300,
                clipHeight: 30,
                title: legendTitle ?? null,
              },
      }
    : { value: selectedColor };

  const pointColorEncoding = colorField ? { field: "{colorField}", type: "nominal" } : { value: selectedColor };

  const lineOpacityEncoding = colorField
    ? {
        condition: [
          { param: "series", value: 1 },
          { test: "!length(data('series_store'))", value: 1 },
        ],
        value: 0.2,
      }
    : { value: 1 };

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
      background: chartBg || colors.white,
      axis: {
        labelFont: typography.body,
        titleFont: typography.heading,
        labelColor: chartLabelColor || colors.gray700,
        titleColor: chartTitleColor || colors.gray800,
        labelFontSize: 12,
      },
      axisX: { ticks: true, domain: true, domainColor: "lightgray", grid: false },
      axisY: { domain: false, ticks: false, tickCount: 3, orient: "left", zindex: 0, gridDash: [2] },
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
        direction: "horizontal",
        columns: legendColumns,
        columnPadding: 10,
        labelLimit: isMobile ? 160 : 300,
      },
      view: { stroke: "transparent" },
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
      { calculate: "toString(datum.startYear) + '-' + substring(toString(datum.startYear + 1), 2)", as: "season" },
      { calculate: valueDisplayCalc, as: "valueDisplay" },
    ],

    layer: [
      ...(colorField || seasonal
        ? []
        : [
            {
              mark: { type: "area", interpolate: "linear", opacity: 0.15, color: selectedColor },
              encoding: { x: xEncoding, y: { field: "{yField}", type: "quantitative" } },
            },
          ]),
      {
        mark: { type: "line", interpolate: "linear", strokeWidth: 3, point: false },
        encoding: {
          x: xEncoding,
          y: {
            field: "{yField}",
            type: "quantitative",
            axis: { title: null, tickCount: 4, 
            ...(isPercent ? { labelExpr: "datum.value + '%'" } : {}),
            scale: {
              domain: [0, maxPlus]
            }
          
            },
          },
          color: lineColorEncoding,
          opacity: lineOpacityEncoding,
          tooltip: sharedTooltip

        },
      },
      {
        params: colorField
          ? [
              {
                name: "series",
                select: { type: "point", fields: ["{colorField}"], on: "pointerdown, touchend, click", clear: "pointerout" },
              },
            ]
          : [],
        mark: { type: "point", filled: true, size: 40, strokeWidth: 1.5 },
        encoding: {
          x: xEncoding,
          y: { field: "{yField}", type: "quantitative" },
          color: pointColorEncoding,
        },
      },
      {
        params: [
          {
            name: "pt",
            select: {
              type: "point",
              fields: colorField ? ["{colorField}", "{xField}"] : ["{xField}"],
              on: "pointermove",
              clear: "pointerout",
            },
          },
        ],
        mark: { type: "point", size: 140, filled: true, fillOpacity: 0.001 },
        encoding: {
          x: xEncoding,
          y: { field: "{yField}", type: "quantitative" },
          ...(colorField ? { color: { field: "{colorField}", type: "nominal" } } : {}),
          tooltip: sharedTooltip,
        },
      },
    ],
  };

  const latestDate = (() => {
    const ts = filteredData
      .map((d) => new Date(d["date"]).getTime())
      .filter((n) => Number.isFinite(n));
    return ts.length ? Math.max(...ts) : null;
  })();

  return (
    <div style={{ width: "100%" }}>
      <VegaLiteWrapper
        data={filteredData}
        specTemplate={specTemplate}
        dynamicFields={{ xField: xKey, yField: yKey, colorField }}
        rendererMode="svg"
      />
      <ChartFooter dataSource={dataSource} latestDate={latestDate} footnote={footnote} />
    </div>
  );
};

export default LineChart;
