import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";

const VegaLiteWrapper = ({ data, specTemplate, dynamicFields = {}, rendererMode = "canvas" }) => {
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

  const resolvedSpec = JSON.parse(JSON.stringify(specTemplate), (_, val) => {
    if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
      const key = val.slice(1, -1);
      if (key === "containerWidth") return containerWidth || 1;
      return dynamicFields[key] ?? val;
    }
    return val;
  });

  resolvedSpec.data = { values: Array.isArray(data) ? data : [] };
  resolvedSpec.width = Math.max(1, containerWidth);
  if (!resolvedSpec.height) resolvedSpec.height = 320;
  if (!resolvedSpec.autosize) resolvedSpec.autosize = { type: "fit", contains: "padding", resize: true };

  const embedKey = `w_${containerWidth}_${resolvedSpec.height}`;

  const onError = (err) => {
    console.error("Vega error:", err);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", minWidth: 0 }}>
      {containerWidth > 0 ? (
        <VegaLite
          key={embedKey}
          spec={resolvedSpec}
          actions={false}
          renderer={rendererMode}   
          onError={onError}
        />
      ) : null}
    </div>
  );
};

VegaLiteWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  specTemplate: PropTypes.object.isRequired,
  dynamicFields: PropTypes.object,
  rendererMode: PropTypes.oneOf(["canvas", "svg"]),
};

export default VegaLiteWrapper;
