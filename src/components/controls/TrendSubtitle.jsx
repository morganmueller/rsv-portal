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
// Normalize trend text and enforce "by" + "%" when the input is numeric-looking
const normalizeTrend = (val) => {
  if (val == null) return "";
  let s = String(val);

  // 1) Strip any "0%" variants (e.g., "+0%", "0.0%") → collapse to "not changed"
  s = s.replace(/([+-]?\s*0(?:\.0+)?%)/gi, "");
  s = s.replace(/\s+/g, " ").trim();
  if (s === "" || /^not\s*changed$/i.test(s)) return "not changed";

  // 2) If it's just a number or a number with optional %, force "by {n}%"
  //    Examples: "30" -> "by 30%", "30%" -> "by 30%"
  if (/^[-+]?\d+(?:\.\d+)?%?$/.test(s)) {
    const n = Math.abs(parseFloat(s.replace("%", "")));
    return `by ${Number.isFinite(n) ? n : s}%`;
  }

  // 3) If it's a phrase like "increased 30", "decreased 12", "up 4.5", "lower 7",
  //    normalize verb and force "by {n}%"
  const m = s.match(
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

  // 4) Otherwise, leave as-is (already well-formed like "increased by 5%")
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
