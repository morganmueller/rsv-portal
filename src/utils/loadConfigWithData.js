// src/utils/loadConfigWithData.js
import { loadCSVData } from "./loadCSVData";
import { hydrateConfigData } from "./filterMetricData";
import { interpolate } from "./interpolate";
import { toSourceVirus } from "./virusMap";

/**
 * Load page config and hydrate each section with filtered data.
 * IMPORTANT: Always convert the UI virus label (e.g., "Flu") to the source label
 * used in CSV/series strings (e.g., "Influenza") BEFORE interpolating props.
 */
export async function loadConfigWithData(config, variables = {}) {
  if (!config?.dataPath) {
    throw new Error("Config is missing 'dataPath'");
  }

  // Resolve dataPath (string or object keyed by dataType)
  let resolvedDataPath = config.dataPath;
  if (typeof resolvedDataPath === "object" && resolvedDataPath !== null) {
    const dataType = variables.dataType || config.defaultDataType || "ed";
    resolvedDataPath = resolvedDataPath[dataType];

    if (!resolvedDataPath) {
      throw new Error(
        `Could not resolve dataPath for dataType: ${variables.dataType || config.defaultDataType || "ed"}. Provided keys: ${Object.keys(
          config.dataPath
        ).join(", ")}`
      );
    }
  }
  if (typeof resolvedDataPath !== "string") {
    throw new Error(
      `Invalid 'dataPath': expected string, got ${typeof resolvedDataPath}`
    );
  }

  // Load raw CSV rows
  const rawData = await loadCSVData(resolvedDataPath);

  // Convert UI virus → source virus used in data (e.g., Flu → Influenza)
  const resolvedVirus = toSourceVirus(variables.virus);

  // Build the base interpolation variables
  const resolvedVars = {
    ...variables,
    virus: resolvedVirus,
    view: variables.view || config.defaultView || "visits",
    dataType: variables.dataType || config.defaultDataType || "ed",
    display: (config.defaultDisplay || "Percent").trim().toLowerCase(),
  };

  // Interpolate props for each section up-front (so {virus} becomes "Influenza")
  const resolvedConfig = {
    ...config,
    sections: (config.sections || []).map((section) => {
      const chart = section.chart || {};
      const props = chart.props || {};

      const interpolatedProps = Object.fromEntries(
        Object.entries(props).map(([key, val]) => {
          const interpolated =
            typeof val === "string" ? interpolate(val, resolvedVars) : val;

          // Normalize display strings (both defaults and per-chart overrides)
          if (key === "display" && typeof interpolated === "string") {
            return [key, interpolated.trim().toLowerCase()];
          }

          return [key, interpolated];
        })
      );

      // Cleanup stray "undefined" strings from template usage
      if (interpolatedProps.submetric === "undefined") {
        interpolatedProps.submetric = undefined;
      }

      // If metricName wasn't specified but a resolver is provided, compute it
      if (
        !interpolatedProps.metricName &&
        typeof props.getMetricNames === "function"
      ) {
        interpolatedProps.metricName = props.getMetricNames({
          virus: resolvedVirus, // use source virus for metric names
          view: resolvedVars.view,
        });
      }

      return {
        ...section,
        chart: {
          ...chart,
          props: interpolatedProps,
        },
      };
    }),
  };

  // Merge all resolved chart props back into the interpolation scope
  // so downstream filters (hydrateConfigData) can use them.
  const mergedVars = {
    ...resolvedVars,
    ...Object.fromEntries(
      resolvedConfig.sections.flatMap((section) =>
        Object.entries(section.chart?.props || {})
      )
    ),
  };

  // Hydrate sections with filtered series based on mergedVars
  return hydrateConfigData(resolvedConfig, rawData, mergedVars);
}
