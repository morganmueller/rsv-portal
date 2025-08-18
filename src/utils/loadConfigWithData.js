import { loadCSVData } from "./loadCSVData";
import { hydrateConfigData } from "./filterMetricData";
import { interpolate } from "./interpolate";

export async function loadConfigWithData(config, variables = {}) {
  if (!config.dataPath) {
    throw new Error("Config is missing 'dataPath'");
  }

  let resolvedDataPath = config.dataPath;

  // ✅ Handle merged dataPath object
  if (typeof resolvedDataPath === "object") {
    const dataType = variables.dataType || config.defaultDataType || "ed";
    resolvedDataPath = resolvedDataPath[dataType];

    if (!resolvedDataPath) {
      throw new Error(
        `Could not resolve dataPath for dataType: ${dataType}. Provided keys: ${Object.keys(config.dataPath).join(", ")}`
      );
    }
  }

  if (typeof resolvedDataPath !== "string") {
    throw new Error(`Invalid 'dataPath': expected string, got ${typeof resolvedDataPath}`);
  }

  const rawData = await loadCSVData(resolvedDataPath);

  const virusMap = {
    "COVID-19": "COVID-19",
    "Influenza": "Influenza",
    RSV: "RSV",
    ARI: "ARI",
  };

  const resolvedVirus = virusMap[variables.virus] || variables.virus;

  const resolvedVars = {
    ...variables,
    virus: resolvedVirus,
    display: (config.defaultDisplay || "Percent").trim().toLowerCase(), 
  };

  const resolvedConfig = {
    ...config,
    sections: config.sections.map((section) => {
      const chart = section.chart || {};
      const props = chart.props || {};

      const interpolatedProps = Object.fromEntries(
        Object.entries(props).map(([key, val]) => {
          const interpolated =
            typeof val === "string" ? interpolate(val, resolvedVars) : val;
      
          if (key === "display" && typeof interpolated === "string") {
            return [key, interpolated.trim().toLowerCase()];
          }
      
          return [key, interpolated];
        })
      );
      

      // 🧼 Cleanup undefined submetric strings
      if (interpolatedProps.submetric === "undefined") {
        interpolatedProps.submetric = undefined;
      }

      // 🧠 Fallback metric name resolution from function
      if (!interpolatedProps.metricName && typeof props.getMetricNames === "function") {
        interpolatedProps.metricName = props.getMetricNames({
          virus: resolvedVirus,
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

  // 🧩 Build mergedVars from all resolved props (interpolated & numeric)
  const mergedVars = {
    ...resolvedVars,
    ...Object.fromEntries(
      resolvedConfig.sections.flatMap((section) =>
        Object.entries(section.chart?.props || {})
      )
    ),
  };

  return hydrateConfigData(resolvedConfig, rawData, mergedVars);
}
