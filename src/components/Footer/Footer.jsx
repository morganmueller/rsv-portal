import React from "react";
import "./Footer.css";
import AboutSection from "./AboutSection";
import QuickLinks from "./QuickLinks";
import ContactSection from "./ContactSection";
import SubscribeSection from "./SubscribeSection";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
 
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-top">
        <AboutSection />
        <QuickLinks />
        <ContactSection />
        <SubscribeSection />
      </div>
      <div className="footer-bottom">
        <MarkdownRenderer
          filePath="/content/footer/footer.md"
          sectionTitle="Footer Text"
          className="footer-copy"
        />
      </div>
    </div>
  </footer>
);

export default Footer;
