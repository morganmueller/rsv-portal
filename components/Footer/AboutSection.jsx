import React from "react";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";

const AboutSection = () => (
  <div className="footer-section about">
    <MarkdownRenderer
      filePath="/content/footer/footer.md"
      sectionTitle="About"
      className="footer-text"
    />
  </div>
);

export default AboutSection;
