import React from "react";
import VegaLiteWrapper from "./VegaLiteWrapper";

const BarChart = ({ data, xField, yField, colorField }) => {
  const specTemplate = {
    mark: "bar",
    encoding: {
      x: { field: "{xField}", type: "ordinal", axis: { title: null } },
      y: { field: "{yField}", type: "quantitative", axis: { title: null } },
      color: colorField ? { field: "{colorField}", type: "nominal" } : undefined
    }
  };

  return (
    <VegaLiteWrapper
      data={data}
      specTemplate={specTemplate}
      dynamicFields={{ xField, yField, colorField }}
    />
  );
};

export default BarChart;
