import React from "react";
import StatCard from "../StatCard";
import "./StatGrid.css";

const StatGrid = () => {
  return (
    <div className="stat-grid">
      <div className="top-row">
        <StatCard
          title="Acute Respiratory Infections"
          icon="/assets/ari-vector.svg"
          visitPercent="3.8%"
          admitPercent="2.5%"
          visitChange="9%"
          admitChange="6%"
          visitDate="as of 5/11"
          admitDate="as of 5/11"
          backgroundColor="#F4C4A5"
        />
        <div className="stat-info-box">
          <h4 className="stat-info-title">Emergency Department Trends</h4>
          <p className="stat-info-description">
            This summary highlights recent patterns in ED visits and admissions related to
            respiratory viruses across NYC. Use the toggles and filters above to explore further.
          </p>
        </div>
      </div>

      <div className="bottom-row">
        <StatCard
          title="COVID-19"
          icon="/assets/covid-vector.svg"
          visitPercent="1.2%"
          admitPercent="0.8%"
          visitChange="12%"
          admitChange="12%"
          visitDate="as of 5/11"
          admitDate="as of 5/11"
          backgroundColor="#EFF6FF"
        />
        <StatCard
          title="Influenza"
          icon="/assets/flu-vector.svg"
          visitPercent="4.3%"
          admitPercent="3.1%"
          visitChange="8%"
          admitChange="7%"
          visitDate="as of 5/11"
          admitDate="as of 5/11"
          backgroundColor="#F5F3FF"
        />
        <StatCard
          title="RSV"
          icon="/assets/rsv-vector.svg"
          visitPercent="2.3%"
          admitPercent="1.2%"
          visitChange="5%"
          admitChange="4%"
          visitDate="as of 5/11"
          admitDate="as of 5/11"
          backgroundColor="#ECFDF5"
        />
      </div>
    </div>
  );
};

export default StatGrid;
