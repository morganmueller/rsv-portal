import React from "react";
import PropTypes from "prop-types";
import "./ChartContainer.css";

const ChartContainer = ({ title, subtitle, chart, sidebar, footer }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title-section">
          {/* <h2 className="chart-title">{title}</h2> */}
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="chart-content">
        {sidebar && <div className="chart-sidebar">{sidebar}</div>}
        <div className="chart-body">
          {chart && <div className="chart-vega">{chart}</div>}
        </div>
      </div>

      {footer && <div className="chart-footer">{footer}</div>}
    </div>
  );
};

ChartContainer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.node,
  chart: PropTypes.node,
  sidebar: PropTypes.node,
  footer: PropTypes.node,
};

export default ChartContainer;
