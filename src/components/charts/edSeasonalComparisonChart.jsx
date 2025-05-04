

  
  import React from "react";
  import { VegaLite } from "react-vega";
  import colors from "../../styles/colors";
  import "../layout/ChartContainer.css";
  
  const defaultData = [
    // Week 1
    { week: "1", season: "2021-22", visits: 3400 },
    { week: "1", season: "2022-23", visits: 4000 },
    { week: "1", season: "2023-24", visits: 4200 },
    { week: "1", season: "2024-25", visits: 4600 },
  
    // Week 2
    { week: "2", season: "2021-22", visits: 3900 },
    { week: "2", season: "2022-23", visits: 4400 },
    { week: "2", season: "2023-24", visits: 4700 },
    { week: "2", season: "2024-25", visits: 5100 },
  
    // Week 3
    { week: "3", season: "2021-22", visits: 3700 },
    { week: "3", season: "2022-23", visits: 4100 },
    { week: "3", season: "2023-24", visits: 4300 },
    { week: "3", season: "2024-25", visits: 4700 },
  
    // Week 4
    { week: "4", season: "2021-22", visits: 3600 },
    { week: "4", season: "2022-23", visits: 4050 },
    { week: "4", season: "2023-24", visits: 4500 },
    { week: "4", season: "2024-25", visits: 4800 },
  
    // Week 5
    { week: "5", season: "2021-22", visits: 3500 },
    { week: "5", season: "2022-23", visits: 4200 },
    { week: "5", season: "2023-24", visits: 4600 },
    { week: "5", season: "2024-25", visits: 5000 },
  
    // Week 6
    { week: "6", season: "2021-22", visits: 3650 },
    { week: "6", season: "2022-23", visits: 4300 },
    { week: "6", season: "2023-24", visits: 4700 },
    { week: "6", season: "2024-25", visits: 5100 },
  
    // Week 7
    { week: "7", season: "2021-22", visits: 3750 },
    { week: "7", season: "2022-23", visits: 4400 },
    { week: "7", season: "2023-24", visits: 4800 },
    { week: "7", season: "2024-25", visits: 5200 },
  
    // Week 8
    { week: "8", season: "2021-22", visits: 3800 },
    { week: "8", season: "2022-23", visits: 4500 },
    { week: "8", season: "2023-24", visits: 4900 },
    { week: "8", season: "2024-25", visits: 5300 }
  ];  
  const virusColors = {
    "COVID-19": colors.bluePrimary,
    "Influenza": colors.purpleAccent,
    "RSV": colors.greenMuted,
    "ARI": colors.orangeMuted
  };
  
  const SeasonalEDChart = ({ data = defaultData, virus = "COVID-19" }) => {
    const dynamicColor = virusColors[virus] || colors.gray700;
  
    const spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Layered histogram comparing seasonal ED visits by week",
      data: { name: "table" },
      width: 800,
      height: 300,
      layer: [
        {
          transform: [{ filter: "datum.season !== '2024-25'" }],
          mark: { type: "bar", opacity: 0.3 },
          encoding: {
            x: { field: "week", type: "ordinal", title: "Week" },
            y: { field: "visits", type: "quantitative", title: "ED Visits" },
            color: {
              field: "season",
              type: "nominal",
              legend: { title: "Previous Seasons" },
              scale: { scheme: "blues" }
            },
            tooltip: [
              { field: "season", type: "nominal" },
              { field: "week", type: "ordinal" },
              { field: "visits", type: "quantitative" }
            ]
          }
        },
        {
          transform: [{ filter: "datum.season === '2024-25'" }],
          mark: { type: "bar", opacity: 1, stroke: "#1E3A8A", strokeWidth: 0.8 },
          encoding: {
            x: { field: "week", type: "ordinal" },
            y: { field: "visits", type: "quantitative" },
            color: { value: dynamicColor },
            tooltip: [
              { field: "season", type: "nominal" },
              { field: "week", type: "ordinal" },
              { field: "visits", type: "quantitative" }
            ]
          }
        }
      ]
    };
  
    return <VegaLite spec={spec} data={{ table: data }} />;
  };
  
  export default SeasonalEDChart;
  