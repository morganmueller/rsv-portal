import React from "react";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";

const ContactSection = () => (
  <div className="footer-section contact">
    <h3 className="footer-title">Contact</h3>
    <MarkdownRenderer
      filePath="/content/footer/footer.md"
      sectionTitle="Contact"
      className="footer-list"
    />
  </div>
);

export default ContactSection;

