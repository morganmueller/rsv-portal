// src/utils/vegaTheme.js
import { tokens } from "../styles/tokens";

// Safely read a CSS var (SSR-friendly)
const cssVar = (name, fallback) => {
  if (typeof document === "undefined") return fallback;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
};

// shallow arrays, deep objects
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
 * @param {"dark"|"light"} mode
 */
export const getVegaThemeConfig = (mode = "light") => {
  const dark = mode === "dark";

  const background = cssVar("--chart-bg", dark ? "#0B0F14" : "#FFFFFF");
  const axisLabel = cssVar(
    "--chart-subtitle-color",
    dark ? "#E5E7EB" : tokens.colors.gray700
  );
  const axisTitle = cssVar(
    "--chart-title-color",
    dark ? "#E5E7EB" : tokens.colors.gray800
  );
  const divider = cssVar("--overview-divider-color", dark ? "#334155" : "#E5E7EB");

  const tooltipBg = cssVar("--tooltip-bg", dark ? "#0B0F14" : "#FFFFFF");
  const tooltipFg = cssVar("--tooltip-fg", dark ? "#E5E7EB" : "#111827");
  const tooltipBorder = cssVar("--tooltip-border", dark ? "#334155" : "#E5E7EB");

  return {
    background,

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

    // vega-lite tooltip theme
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
