import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getVegaThemeConfig, mergeDeep } from "../../utils/vegaTheme";
import { VegaLite } from "react-vega";
import { Handler as TooltipHandler } from "vega-tooltip";


const getInitialDark = () => {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark") return true;
    if (attr === "light") return false;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
};

const VegaLiteWrapper = ({ data, specTemplate, dynamicFields = {}, rendererMode = "canvas" }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDark, setIsDark] = useState(getInitialDark);

  // Resize-aware width
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

  // Watch data-theme changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const mo = new MutationObserver(() => {
      const theme = el.getAttribute("data-theme");
      if (theme === "dark") setIsDark(true);
      else if (theme === "light") setIsDark(false);
    });
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // Watch system preference (fallback)
  useEffect(() => {
    if (!window?.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      // only adopt system when page hasn’t explicitly set data-theme
      const attr = document.documentElement.getAttribute("data-theme");
      if (!attr) setIsDark(e.matches);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Resolve {placeholders} and base spec
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
  if (!resolvedSpec.autosize) {
    resolvedSpec.autosize = { type: "fit", contains: "padding", resize: true };
  }

  // Compute theme and merge (theme provides config/background/axes/etc.)
  const vegaTheme = getVegaThemeConfig(isDark ? "dark" : "light");
  // mergeDeep(left, right) -> returns a new merged object; if your helper differs,
  // adapt this to “merge theme first, spec last” so spec can override theme.
  const finalSpec = mergeDeep(mergeDeep({}, vegaTheme), resolvedSpec);

  const embedKey = `w_${containerWidth}_${finalSpec.height}_${isDark ? "d" : "l"}`;

  const tooltip = new TooltipHandler({
    theme: isDark ? "dark" : "light",           // ← switch theme here
  }).call;

  const onError = (err) => {
    console.error("Vega error:", err);
  };

  return (
    <div ref={containerRef} style={{ width: "100%", minWidth: 0 }}>
      {containerWidth > 0 ? (
        <VegaLite
          key={embedKey}
          spec={finalSpec}
          actions={true}
          renderer={rendererMode}
          tooltip={tooltip}
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
