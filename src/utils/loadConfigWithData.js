import { loadCSVData } from "./loadCSVData";
import { hydrateConfigData } from "./filterMetricData";
import { interpolate } from "./interpolate"; 

export async function loadConfigWithData(config, variables = {}) {
  if (!config.dataPath) {
    throw new Error("Config is missing 'dataPath'");
  }

  const rawData = await loadCSVData(config.dataPath);

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
    display: config.defaultDisplay || "Percent" 

  };

  const resolvedConfig = {
    ...config,
    sections: config.sections.map((section) => {
      const chart = section.chart || {};
      const props = chart.props || {};

      const interpolatedProps = Object.fromEntries(
        Object.entries(props).map(([key, val]) => [
          key,
          typeof val === "string" ? interpolate(val, resolvedVars) : val,
        ])
      );

      return {
        ...section,
        chart: {
          ...chart,
          props: interpolatedProps,
        },
      };
    }),
  };

  // 👇 Pass interpolated props into hydrateConfigData to ensure accurate filtering
  const mergedVars = {
    ...resolvedVars,
    ...Object.fromEntries(
      resolvedConfig.sections.flatMap((section) =>
        Object.entries(section.chart?.props || {}).filter(([_, val]) => typeof val === "string")
      )
    ),
  };

  return hydrateConfigData(resolvedConfig, rawData, mergedVars);
}
