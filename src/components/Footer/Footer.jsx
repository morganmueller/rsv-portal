import React from "react";
import "./Footer.css";
import AboutSection from "./AboutSection";
import QuickLinks from "./QuickLinks";
import ContactSection from "./ContactSection";
import SubscribeSection from "./SubscribeSection";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <AboutSection />
          <QuickLinks />
          <ContactSection />
          <SubscribeSection />
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            © 2025 NYC Department of Health and Mental Hygiene. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
