import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

// --- helpers (QUICK FIX) ---
const stripHtml = (s = "") => s.replace(/<[^>]*>/g, " ");
const collapseWs = (s = "") => s.replace(/\s+/g, " ").trim();
const normalize = (s = "") => collapseWs(stripHtml(String(s))).toLowerCase();

// Extract a specific ## Section and optionally strip render directives
const extractSection = (markdown, sectionTitle, stripRenderDirectives = false) => {
  const lines = markdown.split("\n");
  const result = [];
  let capture = false;

  const normalizedTarget = normalize(sectionTitle);

  for (const rawLine of lines) {
    const line = rawLine ?? "";
    const trimmed = line.trim();
    const isHeading = trimmed.startsWith("## ");

    if (isHeading) {
      // keep raw heading text from MD, normalize for comparison
      const headingText = trimmed.slice(3).trim();
      const normalizedHeading = normalize(headingText);

      if (normalizedHeading === normalizedTarget) {
        capture = true;
        continue;
      } else if (capture) {
        break; // reached next heading after capturing
      }
    }

    if (capture) {
      const isRenderDirective = /^render:\s*/i.test(trimmed);
      if (stripRenderDirectives && isRenderDirective) continue;
      result.push(line);
    }
  }

  return result.join("\n").trim();
};

const interpolate = (markdown, variables = {}) =>
  markdown.replace(/{(\w+)}/g, (_, key) => (key in variables ? variables[key] : `{${key}}`));

const MarkdownRenderer = ({
  filePath,
  rawContent,
  sectionTitle,
  showTitle = false,
  className = "markdown-body",
  variables = {},
  stripRenderDirectives = false
}) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        let markdown = rawContent;

        if (!markdown && filePath) {
          const response = await fetch(filePath);
          if (!response.ok) throw new Error(`Markdown file not found or inaccessible: ${filePath}`);
          markdown = await response.text();
        }

        const interpolated = interpolate(markdown, variables);

        let content;
        if (sectionTitle) {
          const section = extractSection(interpolated, sectionTitle, stripRenderDirectives);
          const displayTitle = collapseWs(stripHtml(sectionTitle));
          content =
            section && section.length
              ? section
              : `### ${displayTitle}\n_Section not found._`;
        } else {
          content = interpolated;
        }

        setHtml(marked.parse(content));
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setHtml(`<p style="color:red;"><strong>Error:</strong> ${err.message}</p>`);
      }
    };

    load();
  }, [filePath, rawContent, sectionTitle, variables, stripRenderDirectives]);

  const cleanDisplayTitle = sectionTitle ? collapseWs(stripHtml(sectionTitle)) : "";

  return (
    <div className={className}>
      {showTitle && sectionTitle && <h3>{cleanDisplayTitle}</h3>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

MarkdownRenderer.propTypes = {
  filePath: PropTypes.string,
  rawContent: PropTypes.string,
  sectionTitle: PropTypes.string,       // may contain HTML spans; we strip them
  showTitle: PropTypes.bool,
  className: PropTypes.string,
  variables: PropTypes.object,
  stripRenderDirectives: PropTypes.bool
};

export default MarkdownRenderer;
