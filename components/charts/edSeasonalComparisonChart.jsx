import React from "react";
import { VegaLite } from "react-vega";
import colors from "../../styles/colors";
import "../layout/ChartContainer.css";

const defaultData = [
  { week: "2025-04-01", visits: 12000, hospitalizations: 3000 },
  { week: "2025-04-08", visits: 12500, hospitalizations: 3100 },
  { week: "2025-04-15", visits: 13000, hospitalizations: 3200 },
  { week: "2025-04-22", visits: 14000, hospitalizations: 3500 },
  { week: "2025-04-29", visits: 15000, hospitalizations: 3700 }
];

const virusColors = {
  "COVID-19": colors.bluePrimary,
  "Influenza": colors.purpleAccent,
  "RSV": colors.greenMuted,
  "ARI": colors.orangeMuted
};

const SeasonalEDChart = ({ data = defaultData, virus = "COVID-19", view = "visits" }) => {
  const dynamicColor = virusColors[virus] || colors.gray700;

  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Simple weekly bar chart of ED activity",
    data: { name: "table" },
    width: 800,
    height: 300,
    mark: { type: "bar", opacity: 1, stroke: "#1E3A8A", strokeWidth: 0.8 },
    encoding: {
      x: { field: "week", type: "ordinal", title: "Week" },
      y: { field: view, type: "quantitative", title: `ED ${view === "hospitalizations" ? "Hospitalizations" : "Visits"}` },
      color: { value: dynamicColor },
      tooltip: [
        { field: "week", type: "ordinal" },
        { field: view, type: "quantitative", title: view === "hospitalizations" ? "Hospitalizations" : "Visits" }
      ]
    }
  };

  return <VegaLite spec={spec} data={{ table: data }} />;
};

export default SeasonalEDChart;
