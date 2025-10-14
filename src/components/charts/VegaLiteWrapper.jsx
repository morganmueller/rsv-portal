import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext
} from "react";
import PropTypes from "prop-types";
import { VegaLite } from "react-vega";
import { Handler as TooltipHandler } from "vega-tooltip";
import { getVegaThemeConfig, mergeDeep } from "../../utils/vegaTheme";

export const VegaThemeContext = createContext(false);

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

const VegaLiteWrapper = ({
  data,
  specTemplate,
  dynamicFields = {},
  rendererMode = "canvas",
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDark, setIsDark] = useState(getInitialDark);

  /** Track container width with ResizeObserver (for responsive width) */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let rafId;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entries[0]?.contentRect?.width || entry.contentRect?.width || 0;
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

  /** Watch data-theme on <html> and flip dark mode */
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

  /** Fallback: adopt system preference if page hasn’t explicitly set data-theme */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (!attr) setIsDark(e.matches);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  /** Build a concrete spec from the template + dynamic fields + current width */
  const finalSpec = useMemo(() => {
    // 1) Deep-clone and resolve {placeholders}
    const resolvedSpec = JSON.parse(
      JSON.stringify(specTemplate),
      (_, val) => {
        if (typeof val === "string" && val.startsWith("{") && val.endsWith("}")) {
          const key = val.slice(1, -1);
          if (key === "containerWidth") return containerWidth || 1;
          return dynamicFields[key] ?? val;
        }
        return val;
      }
    );

    // 2) Provide data, responsive width/height, and autosize defaults
    resolvedSpec.data = { values: Array.isArray(data) ? data : [] };
    resolvedSpec.width = Math.max(1, containerWidth);
    if (!resolvedSpec.height) resolvedSpec.height = 320;
    if (!resolvedSpec.autosize) {
      resolvedSpec.autosize = { type: "fit", contains: "padding", resize: true };
    }

    // 3) Compute theme (returns { background, config: { axis, legend, … } })
    const theme = getVegaThemeConfig(isDark ? "dark" : "light");

    // 4) Merge ORDER: spec first → theme last (theme should win for axis colors)
    let merged = mergeDeep(mergeDeep({}, resolvedSpec), theme);

    // 5) Ensure guide styles mirror axis colors in all Vega versions
    const axisLabel = merged.config?.axis?.labelColor;
    const axisTitle = merged.config?.axis?.titleColor;
    merged.config = merged.config || {};
    merged.config.style = {
      ...(merged.config.style || {}),
      "guide-label": {
        ...(merged.config.style?.["guide-label"] || {}),
        ...(axisLabel ? { fill: axisLabel } : {}),
      },
      "guide-title": {
        ...(merged.config.style?.["guide-title"] || {}),
        ...(axisTitle ? { fill: axisTitle } : {}),
      },
    };

    return merged;
  }, [data, specTemplate, dynamicFields, containerWidth, isDark]);

  /** Force a full re-embed on width/height/theme changes */
  const embedKey = `w_${containerWidth}_${finalSpec?.height}_${isDark ? "d" : "l"}`;

  /** Hide tooltip helper */
  const hideTooltip = React.useCallback(() => {
    const el = document.getElementById("vg-tooltip-element");
    if (el) el.style.display = "none";
  }, []);

  /** Global listeners to dismiss tooltip on outside tap/scroll/escape */
  useEffect(() => {
    const onDocPointerDown = (e) => {
      const node = containerRef.current;
      if (!node) return;
      if (!node.contains(e.target)) hideTooltip();
    };
    const onKeyDown = (e) => { if (e.key === "Escape") hideTooltip(); };
    const onScroll = () => hideTooltip();

    document.addEventListener("pointerdown", onDocPointerDown, true); // capture outside first
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("orientationchange", hideTooltip);
    document.addEventListener("visibilitychange", hideTooltip);

    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", hideTooltip);
      window.removeEventListener("orientationchange", hideTooltip);
      document.removeEventListener("visibilitychange", hideTooltip);
    };
  }, [hideTooltip]);

  /** vega-tooltip with mobile-friendly positioning (center + clamp) */
  const tooltip = useMemo(() => {
    const base = new TooltipHandler({
      theme: isDark ? "dark" : "light",
      offsetX: 0,
      offsetY: 12,
      style: {
        maxWidth: "min(280px, 92vw)",
        fontSize: "12px",
        lineHeight: "1.35",
        padding: "8px 10px",
      },
    });
    const call = base.call;

    return (handler, event, item, value) => {
      call(handler, event, item, value);
      // Reposition + ensure visible
      requestAnimationFrame(() => {
        const el = document.getElementById("vg-tooltip-element");
        if (!el || !event) return;

        // Re-show if a previous tap hid it
        el.style.display = "block";
        el.style.position = "fixed";

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = el.getBoundingClientRect();

        // Center under the touch/cursor with 12px offset
        const gutter = 8;
        let left = Math.round((event.clientX ?? 0) - rect.width / 2);
        let top  = Math.round((event.clientY ?? 0) + 12);

        // Clamp to viewport
        left = Math.max(gutter, Math.min(left, vw - rect.width - gutter));
        top  = Math.max(gutter, Math.min(top,  vh - rect.height - gutter));

        el.style.left = `${left}px`;
        el.style.top  = `${top}px`;
      });
    };
  }, [isDark]);

  const onError = (err) => {
    // eslint-disable-next-line no-console
    console.error("Vega error:", err);
  };

  return (
    <VegaThemeContext.Provider value={isDark}>
      <div
        ref={containerRef}
        style={{ width: "100%", minWidth: 0 }}
        // Hide any existing tooltip immediately when a new gesture starts,
        // so tapping blank space also dismisses it.
        onPointerDownCapture={hideTooltip}
      >
        {containerWidth > 0 ? (
          <VegaLite
            key={embedKey}
            spec={finalSpec}
            actions={false}
            renderer={rendererMode}
            tooltip={tooltip}
            onError={onError}
          />
        ) : null}
      </div>
    </VegaThemeContext.Provider>
  );
};

VegaLiteWrapper.propTypes = {
  data: PropTypes.array.isRequired,
  specTemplate: PropTypes.object.isRequired,
  dynamicFields: PropTypes.object,
  rendererMode: PropTypes.oneOf(["canvas", "svg"]),
};

export default VegaLiteWrapper;
