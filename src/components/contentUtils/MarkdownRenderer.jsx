import React, { useEffect, useState } from "react";
import { marked } from "marked";
import "./markdown.css";

const MarkdownRenderer = ({ filePath, sectionTitle, showTitle = false }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        if (sectionTitle) {
          const sectionRegex = new RegExp(`## ${sectionTitle}\\n+([\\s\\S]*?)(?=\\n## |\\n?$)`, "m");
          const match = text.match(sectionRegex);
          const extracted = match
          ? (showTitle ? `## ${sectionTitle}\n${match[1].trim()}` : match[1].trim())
          : "*Section not found.*";
                    setHtml(marked.parse(extracted));
        } else {
          setHtml(marked.parse(text));
        }
      })
      .catch((err) => {
        console.error("Error loading markdown file:", err);
        setHtml("<p>Error loading content.</p>");
      });
  }, [filePath, sectionTitle, showTitle]);

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default MarkdownRenderer;
