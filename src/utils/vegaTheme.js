// src/utils/vegaTheme.js
import { tokens } from "../styles/tokens";

/**
 * Safely read a CSS var (SSR-friendly).
 * Prefer the element that holds the `data-theme` attribute (often <body>),
 * then fall back to :root (<html>).
 */
const cssVar = (name, fallback) => {
  if (typeof document === "undefined") return fallback;
  const read = (el) => (el ? getComputedStyle(el).getPropertyValue(name).trim() : "");
  return read(document.body) || read(document.documentElement) || fallback;
};

/** Shallow arrays, deep objects */
export const mergeDeep = (a = {}, b = {}) => {
  const out = { ...a };
  for (const k of Object.keys(b)) {
    const v = b[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeDeep(out[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

/**
 * Build a Vega-Lite theme from CSS variables.
 * Returns an object shaped like:
 *   { background, config: { axis, legend, view, style, ... } }
 *
 * @param {"dark"|"light"} mode
 */
export const getVegaThemeConfig = (mode = "light") => {
  const dark = mode === "dark";

  // Background
  const background = cssVar("--chart-bg", dark ? "#0B0F14" : "#FFFFFF");

  // Axis text colors
  const axisLabel = cssVar(
    "--chart-subtitle-color",
    dark ? "#F3F4F6" : tokens.colors.gray700
  );
  const axisTitle = cssVar(
    "--chart-title-color",
    dark ? "#FFFFFF" : tokens.colors.gray800
  );

  // Lines / ticks
  const divider = cssVar("--overview-divider-color", dark ? "#334155" : "#E5E7EB");

  // Tooltip (only used if you choose to rely on embed config; your wrapper uses TooltipHandler)
  const tooltipBg = cssVar("--vgtt-bg", dark ? "#0B0F14" : "#FFFFFF");
  const tooltipFg = cssVar("--vgtt-fg", dark ? "#E5E7EB" : "#111827");
  const tooltipBorder = cssVar("--vgtt-border", dark ? "#334155" : "#E5E7EB");

  return {
    // Keep background at the top level (Vega-Lite reads it here)
    background,

    // All visual knobs must live under `config`
    config: {
      axis: {
        labelFont: tokens.typography.body,
        titleFont: tokens.typography.heading,
        labelFontSize: 12,
        labelColor: axisLabel,
        titleColor: axisTitle,
        domainColor: divider,
        tickColor: divider,
        grid: false,
      },

      axisX: {
        ticks: true,
        domain: true,
        domainColor: divider,
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
        labelFont: tokens.typography.body,
        titleFont: tokens.typography.heading,
        labelColor: axisLabel,
        titleColor: axisTitle,
        symbolSize: 100,
        symbolStrokeWidth: 5,
        orient: "bottom",
      },

      view: { stroke: "transparent" },

      // Belt & suspenders: some Vega versions/style paths use these named styles
      style: {
        "guide-label": { fill: axisLabel, font: tokens.typography.body },
        "guide-title": { fill: axisTitle, font: tokens.typography.heading },
      },
    },

    // Optional: only used by vega-embed config.tooltip; harmless to include.
    tooltip: {
      cornerRadius: 6,
      fill: tooltipBg,
      fillOpacity: 1,
      stroke: tooltipBorder,
      strokeWidth: 1,
      color: tooltipFg,
    },
  };
};
