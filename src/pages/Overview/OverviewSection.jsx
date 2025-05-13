import React from "react";
import PropTypes from "prop-types";
import "./OverviewSection.css";

const OverviewSection = ({ leftTitle, rightTitle, leftContent, rightContent }) => {
  return (
    <section className="overview-section">
      <div className="overview-container">
        <div className="overview-columns">
          <div className="overview-column">
            {leftTitle && <h2 className="overview-title">{leftTitle}</h2>}
            {leftContent}
          </div>
          <div className="overview-column">
            {rightTitle && <h2 className="overview-title">{rightTitle}</h2>}
            {rightContent}
          </div>
        </div>
      </div>
    </section>
  );
};

OverviewSection.propTypes = {
  leftTitle: PropTypes.string,
  rightTitle: PropTypes.string,
  leftContent: PropTypes.node,
  rightContent: PropTypes.node,
};

export default OverviewSection;
