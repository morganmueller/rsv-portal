import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";

const VegaLiteWrapper = ({ data, specTemplate, dynamicFields = {} }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const spec = JSON.parse(JSON.stringify(specTemplate), (_, val) =>
    typeof val === "string" && val.startsWith("{") && val.endsWith("}")
      ? dynamicFields[val.slice(1, -1)]
      : val
  );

  spec.data = { values: data };
  spec.width = containerWidth; 
  spec.autosize = { type: "fit", contains: "padding" };

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      {containerWidth > 0 ? <VegaLite spec={spec} /> : null}
    </div>
  );
};

VegaLiteWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  specTemplate: PropTypes.object.isRequired,
  dynamicFields: PropTypes.object
};

export default VegaLiteWrapper;