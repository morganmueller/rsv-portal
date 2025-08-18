import React from "react";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";

const QuickLinks = () => (
  <div className="footer-section links">
    <h3 className="footer-title">Quick Links</h3>
    <MarkdownRenderer
      filePath="/content/footer/footer.md"
      sectionTitle="Quick Links"
      className="footer-list"
    />
  </div>
);

export default QuickLinks;
