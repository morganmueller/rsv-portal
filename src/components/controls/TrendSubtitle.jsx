import React from "react";
import PropTypes from "prop-types";
import GroupDropdown from "./GroupDropdown";

/**
 * TrendSubtitle
 * - template: string with tokens like {virus}, {trend}, {group}
 * - variables: map of token -> value (values may be plain text or HTML strings)
 * - groupProps: props for GroupDropdown when {group} token is present
 */
const TrendSubtitle = ({ template, variables = {}, groupProps }) => {
  if (!template) return null;

  // Normalize trend text: remove any 0% variants and collapse to "not changed" if nothing remains
  const normalizeTrend = (val) => {
    if (val == null) return "";
    let s = String(val);

    // If the value already contains HTML (e.g., <span class="trend-neutral">not changed 0%</span>),
    // operate on the whole string so we remove the "0%" while preserving the rest.
    // Remove any "+0%", "-0%", "0%", "0.0%", "0.00%", etc. (with optional surrounding spaces)
    s = s.replace(/([+-]?\s*0(?:\.0+)?%)/gi, "");

    // Collapse whitespace left behind
    s = s.replace(/\s+/g, " ").trim();

    // If now empty (or already "not changed"), standardize
    if (s === "" || /^not\s*changed$/i.test(s)) {
      return "not changed";
    }

    return s;
  };

  // Interpolate a string fragment, replacing {tokens}. Trend token gets special treatment.
  const interpolate = (fragment) =>
    fragment.replace(/{(\w+)}/g, (_, key) => {
      let v = variables[key];

      if (key === "trend") {
        // Allow either raw text or HTML in variables.trend
        const normalized = normalizeTrend(v);
        // If caller also provides trendDirection ("up"|"down"|"neutral"), decorate it
        const direction = variables.trendDirection || "neutral";
        // If the original was HTML, we still wrap the normalized text so style is consistent
        return `<span class="trend-text trend-${direction} bg-highlight">${normalized}</span>`;
      }

      // For other tokens: clean null/undefined noise, preserve HTML if provided
      if (v == null || v === "null" || v === "undefined") return "";
      const s = String(v).replace(/\bnull\b|\bundefined\b/gi, "").trim();
      return s;
    });

  // Split on {group} so we can drop in the actual component
  const parts = template.split(/({group})/g);

  return (
    <span
      className="chart-subtitle"
      style={{ margin: "8px 0", display: "inline-flex", flexWrap: "wrap", alignItems: "center" }}
    >
      {parts.map((part, idx) => {
        if (part === "{group}") {
          if (!groupProps) return null;
          return (
            <GroupDropdown
              key={`group-${idx}`}
              options={groupProps.options}
              active={groupProps.active}
              onChange={groupProps.onChange}
              label=""
              inline
            />
          );
        }

        const html = interpolate(part);

        return (
          <span
            key={`frag-${idx}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
};

TrendSubtitle.propTypes = {
  template: PropTypes.string,
  variables: PropTypes.object,
  groupProps: PropTypes.shape({
    options: PropTypes.array.isRequired,
    active: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }),
};

export default TrendSubtitle;
