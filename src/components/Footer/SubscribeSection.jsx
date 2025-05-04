import React from "react";

const SubscribeSection = () => (
  <div className="footer-section subscribe">
    <h3 className="footer-title">Stay Updated</h3>
    <div className="subscribe-form">
      <input
        className="subscribe-input"
        placeholder="Enter your email"
        type="email"
      />
      <button className="subscribe-button">Subscribe</button>
    </div>
  </div>
);

export default SubscribeSection;
