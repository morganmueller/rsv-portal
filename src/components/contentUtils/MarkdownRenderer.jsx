import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { marked } from "marked";

// Extracts a specific ## Heading section
const extractSection = (markdown, sectionTitle) => {
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
        break; // end capture on next heading
      }
    }
    if (capture) result.push(line);
  }

  return result.join("\n").trim();
};

// Replaces {tokens} with values
const interpolate = (markdown, variables = {}) => {
  return markdown.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`);
};

const MarkdownRenderer = ({
  filePath,
  rawContent,
  sectionTitle,
  showTitle = false,
  className = "markdown-body",
  variables = {}
}) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        let markdown = rawContent;

        if (!markdown) {
          const response = await fetch(filePath);
          if (!response.ok) {
            throw new Error(`Markdown file not found or inaccessible: ${filePath}`);
          }
          markdown = await response.text();
        }

        // First interpolate full markdown so headers contain resolved text
        const interpolatedMarkdown = interpolate(markdown, variables);

        // Then extract the section using already-interpolated heading
        const contentToRender = sectionTitle
          ? extractSection(interpolatedMarkdown, sectionTitle) ||
            `### ${sectionTitle}\n_Section not found._`
          : interpolatedMarkdown;

        setHtml(marked.parse(contentToRender));
      } catch (err) {
        console.error("Failed to load markdown:", err);
        setHtml(`<p style="color:red;"><strong>Error:</strong> ${err.message}</p>`);
      }
    };
    console.log("Loading markdown from:", filePath);

    load();
  }, [filePath, rawContent, sectionTitle, variables]);

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
  variables: PropTypes.object
};

export default MarkdownRenderer;
