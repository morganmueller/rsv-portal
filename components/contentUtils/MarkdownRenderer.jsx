import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

// Extract a specific ## Section and optionally strip render directives
const extractSection = (markdown, sectionTitle, stripRenderDirectives = false) => {
  const lines = markdown.split("\n");
  const result = [];
  let capture = false;
  const normalizedTarget = sectionTitle.trim().toLowerCase();

  for (const line of lines) {
    const isHeading = line.trim().startsWith("## ");
    if (isHeading) {
      const headingText = line.trim().slice(3).trim().toLowerCase();
      if (headingText === normalizedTarget) {
        capture = true;
        continue;
      } else if (capture) {
        break;
      }
    }

    if (capture) {
      const isRenderDirective = /^render:\s*/i.test(line.trim());
      if (stripRenderDirectives && isRenderDirective) continue;
      result.push(line);
    }
  }

  return result.join("\n").trim();
};

const interpolate = (markdown, variables = {}) =>
  markdown.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`);

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
          if (!response.ok) {
            throw new Error(`Markdown file not found or inaccessible: ${filePath}`);
          }
          markdown = await response.text();
        }

        const interpolated = interpolate(markdown, variables);

        const content = sectionTitle
          ? extractSection(interpolated, sectionTitle, stripRenderDirectives) ||
            `### ${sectionTitle}\n_Section not found._`
          : interpolated;

        setHtml(marked.parse(content));
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setHtml(`<p style="color:red;"><strong>Error:</strong> ${err.message}</p>`);
      }
    };

    load();
  }, [filePath, rawContent, sectionTitle, variables, stripRenderDirectives]);

  return (
    <div className={className}>
      {showTitle && sectionTitle && <h3>{sectionTitle}</h3>}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

MarkdownRenderer.propTypes = {
  filePath: PropTypes.string,
  rawContent: PropTypes.string,
  sectionTitle: PropTypes.string,
  showTitle: PropTypes.bool,
  className: PropTypes.string,
  variables: PropTypes.object,
  stripRenderDirectives: PropTypes.bool
};

export default MarkdownRenderer;
