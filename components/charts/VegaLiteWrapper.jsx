// VegaLiteWrapper.jsx
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";

const VegaLiteWrapper = ({ data, specTemplate, dynamicFields = {} }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let rafId;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || 0;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (w > 0) setContainerWidth(w);
        });
      }
    });

    observer.observe(node);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Deep clone + substitute {field} AND {containerWidth}
  const resolvedSpec = JSON.parse(JSON.stringify(specTemplate), (_, val) => {
    if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
      const key = val.slice(1, -1);
      if (key === "containerWidth") return containerWidth || 1;
      return dynamicFields[key] ?? val;
    }
    return val;
  });

  // Provide data
  resolvedSpec.data = { values: Array.isArray(data) ? data : [] };

  // We are using a numeric width; do NOT also use autosize:fit
  resolvedSpec.width = containerWidth || 1;
  if (resolvedSpec.autosize && typeof resolvedSpec.autosize === "object") {
    delete resolvedSpec.autosize.type;
    delete resolvedSpec.autosize.resize;
  }

  const embedKey = `w_${containerWidth}`;

  return (
    <div ref={containerRef} style={{ width: "100%", minWidth: 0 }}>
      {containerWidth > 0 ? (
        <VegaLite key={embedKey} spec={resolvedSpec} actions={false} renderer="canvas" />
      ) : null}
    </div>
  );
};

VegaLiteWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  specTemplate: PropTypes.object.isRequired,
  dynamicFields: PropTypes.object,
};

export default VegaLiteWrapper;
