import React, { useEffect, useState, useMemo } from "react";
import { VegaLite } from "react-vega";
import colors from "../../styles/colors";
import "../layout/ChartContainer.css";

const ExampleChart = ({ data, view }) => {
  const [fadeState, setFadeState] = useState("fade-in");
  const [activeView, setActiveView] = useState(view);

  useEffect(() => {
    if (view === activeView) return;
    setFadeState("fade-out");
    const timeout = setTimeout(() => {
      setActiveView(view);
      setFadeState("fade-in");
    }, 300);
    return () => clearTimeout(timeout);
  }, [view, activeView]);

  const yField = activeView === "visits" ? "visits" : "hospitalizations";
  const yTitle = activeView === "visits" ? "ARI Visits" : "ARI Hospitalizations";
  const chartColor = activeView === "visits" ? colors.orangePrimary : colors.orangeAccent;

  const spec = useMemo(() => ({
    $schema: "https://vega.github.io/schema/vega-lite/v6.json",
    description: "Weekly ARI trends",
    width: 900, 
    height: 300,
    autosize: { type: "fit", contains: "padding" },
    data: { values: data },
    mark: {
      type: "bar",
      cornerRadiusTopLeft: 4,
      cornerRadiusTopRight: 4
    },
    encoding: {
      x: {
        field: "week",
        type: "temporal",
        timeUnit: "yearmonthdate",
        title: "Week",
        axis: { format: "%b %d", labelAngle: -40 }
      },
      y: {
        field: yField,
        type: "quantitative",
        title: yTitle
      },
      color: { value: chartColor },
      tooltip: [
        { field: "week", type: "temporal", title: "Week" },
        { field: yField, type: "quantitative", title: yTitle }
      ]
    }
  }), [data, activeView, yField, yTitle, chartColor]);

  return (
    <div className={`chart-fade-wrapper ${fadeState}`}>
      <div className="chart-vega-wrapper">
      <VegaLite
  spec={spec}
  actions={false}
  config={{
    autosize: { type: "fit", contains: "padding" }
  }}
/>      </div>
    </div>
  );
};

export default ExampleChart;
