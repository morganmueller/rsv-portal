import React from "react";
import PropTypes from "prop-types";
import "./DataPageLayout.css";

const DataPageLayout = ({ title, subtitle, topControls, info, children }) => (
  <main className="data-page">
    <div className="data-section-wrapper">
      <div className="data-section-container">
        <h2 className="data-title">{title}</h2>
        {subtitle && <p className="data-subtitle">{subtitle}</p>}

        {topControls && (
  <div className="data-controls-wrapper">
    <div className="data-controls-row">
      {topControls}
    </div>
  </div>
)}

        <hr className="data-divider" />
        <div className="info-container">{info}</div>

      </div>
    </div>
    <div className="data-highlight">
      <div className="data-container">{children}</div>
    </div>
  </main>
);

DataPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  topControls: PropTypes.node,
  info: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default DataPageLayout;
