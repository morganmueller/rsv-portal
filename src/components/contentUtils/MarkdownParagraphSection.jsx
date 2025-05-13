import React from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "./MarkdownRenderer";
import "./MarkdownParagraphSection.css";

const MarkdownParagraphSection = ({ markdown, sectionTitle, title }) => {
  return (
    <section className="markdown-paragraph-section">
      <h2 className="markdown-paragraph-title">{title || sectionTitle}</h2>
      <MarkdownRenderer
        rawContent={markdown}
        sectionTitle={sectionTitle}
        showTitle={false}
        stripRenderDirectives={true}
      />
    </section>
  );
};

MarkdownParagraphSection.propTypes = {
  markdown: PropTypes.string.isRequired,
  sectionTitle: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default MarkdownParagraphSection;
