import React from "react";
import StatCard from "../StatCard";
import "./StatGrid.css";
import covidIcon from "../../../public/assets/covid-vector.svg";
import fluIcon from "../../../public/assets/flu-vector.svg";
import rsvIcon from "../../../public/assets/rsv-vector.svg";
import ariIcon from "../../../public/assets/ari-vector.svg";

const StatGrid = () => {
  return (
    <div className="stat-grid">
      <div className="top-row">
        <StatCard
          title="Acute Respiratory Infections"
          year="2025"
          icon={ariIcon}
          visitPercent="3.8%"
          admitPercent="2.5%"
          visitChange="9%"
          admitChange="6%"
          subtitle="Emergency Department"
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
          year="2025"
          icon={covidIcon}
          visitPercent="1.2%"
          admitPercent="0.8%"
          visitChange="12%"
          admitChange="12%"
          subtitle="Emergency Department"
          backgroundColor="#EFF6FF"
        />
        <StatCard
          title="Influenza"
          year="2025"
          icon={fluIcon}
          visitPercent="4.3%"
          admitPercent="3.1%"
          visitChange="8%"
          admitChange="7%"
          subtitle="Emergency Department"
          backgroundColor="#F5F3FF"
        />
        <StatCard
          title="RSV"
          year="2025"
          icon={rsvIcon}
          visitPercent="2.3%"
          admitPercent="1.2%"
          visitChange="5%"
          admitChange="4%"
          subtitle="Emergency Department"
          backgroundColor="#ECFDF5"
        />
      </div>
    </div>
  );
};

export default StatGrid;
