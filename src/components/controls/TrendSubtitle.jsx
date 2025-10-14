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



  // Normalize trend text and enforce "by {n}%" when the input is numeric-looking
  const normalizeTrend = (val) => {
    if (val == null) return "";
    let s = String(val);

    // Strip tags for parsing
    const textOnly = s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    // Collapse explicit zero to "not changed"
    if (
      /^[-+]?\s*0(?:\.0+)?\s*%$/i.test(textOnly) || // "0%", "+0%", "0.0%"
      /\b(increase(?:d)?|decrease(?:d)?|up|down|higher|lower)\b(?:\s+by)?\s+[-+]?\s*0(?:\.0+)?\s*%$/i.test(textOnly)
    ) {
      return "not changed";
    }

    // If it's just a number or a number with optional %, force "by {n}%"
    // Examples: "30" -> "by 30%", "30%" -> "by 30%"
    if (/^[-+]?\d+(?:\.\d+)?%?$/.test(textOnly)) {
      const n = Math.abs(parseFloat(textOnly.replace("%", "")));
      return Number.isFinite(n) ? `by ${n}%` : textOnly;
    }

    // If it's a phrase like "increased 30", "decreased 12", "up 4.5", normalize to "{verb} {n}%"
    const m = textOnly.match(
      /\b(increase(?:d)?|decrease(?:d)?|up|down|higher|lower)\b(?:\s+by)?\s+([-+]?\d+(?:\.\d+)?)(%?)/i
    );
    if (m) {
      const verb = m[1].toLowerCase();
      const num = Math.abs(parseFloat(m[2]));
      const normalizedVerb =
        verb === "up" || verb === "higher"
          ? "increased"
          : verb === "down" || verb === "lower"
          ? "decreased"
          : verb.endsWith("d")
          ? verb
          : `${verb}d`; // "increase" -> "increased", "decrease" -> "decreased"

      if (Number.isFinite(num)) {
        return `${normalizedVerb} ${num}%`;
      }
    }

    // Otherwise, leave as-is (already well-formed like "increased by 5%")
    return textOnly;
  };

  // Interpolate a string fragment, replacing {tokens}. Trend token gets special treatment.
  const interpolate = (fragment) =>
    fragment.replace(/{(\w+)}/g, (_, key) => {
      let v = variables[key];

      if (key === "trend") {
        // Allow either raw text or HTML in variables.trend
        const normalized = normalizeTrend(v);

        // Accept "up"|"down"|"same"|"neutral"|"none" from caller; normalize to "same" for neutral/none
        let direction = variables.trendDirection || "neutral";
        if (direction === "neutral" || direction === "none") direction = "same";

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
