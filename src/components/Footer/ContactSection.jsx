import React from "react";

const ContactSection = () => (
  <div className="footer-section contact">
    <h3 className="footer-title">Contact</h3>
    <ul className="footer-list">
      <li className="footer-list-item">
        <span className="footer-contact-text">(212) 555-0123</span>
        <img
          className="footer-icon"
          alt="Phone Icon"
          src="https://c.animaapp.com/gDgDv3V4/img/frame-17.svg"
        />
      </li>
      <li className="footer-list-item">
        <span className="footer-contact-text">info@dohmh.nyc.gov</span>
        <img
          className="footer-icon"
          alt="Email Icon"
          src="https://c.animaapp.com/gDgDv3V4/img/frame-18.svg"
        />
      </li>
    </ul>
  </div>
);

export default ContactSection;
