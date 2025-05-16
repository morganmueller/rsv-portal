import React from "react";
import { getThemeByTitle } from "../utils/themeUtils"; // <-- updated import
import "./StatCard.css";

const StatCard = ({
  title,
  icon,
  visitPercent,
  admitPercent,
  visitChange,
  admitChange,
  visitDate,
  admitDate,
}) => {
  const { color: statColor, background: cardBackground, icon: defaultIcon } = getThemeByTitle(title);
  const iconSrc = icon || defaultIcon;

  const getChangeArrow = (change) => {
    const num = parseFloat(change);
    const isUp = num >= 0;
    const arrow = isUp ? "Up (▲)" : "Down (▼)";
    const color = isUp ? "#B36C31" : "#059669"; // optionally import from tokens if consistent
    return <span style={{ color, marginRight: 4 }}>{arrow}</span>;
  };

  return (
    <div className="stat-card" style={{ backgroundColor: cardBackground }}>
      <div className="stat-card-header">
        {iconSrc && <img className="stat-card-icon" src={iconSrc} alt={`${title} icon`} />}
        <div className="stat-card-title">{title}</div>
      </div>

      <div className="stat-block">
  <div className="stat-percent" style={{ color: statColor }}>{visitPercent}</div>
  <div className="stat-detail">
    <div className="stat-label" style={{ color: statColor, textAlign: "left" }}>
      of Visits
    </div>
    <div className="stat-trend-row">
      {getChangeArrow(visitChange)}
      {visitChange} · <span className="stat-date">{visitDate}</span>
    </div>
  </div>
</div>


      <hr className="stat-divider" />

      <div className="stat-block">
        <div className="stat-percent" style={{ color: statColor }}>{admitPercent}</div>
        <div className="stat-detail">
          <div className="stat-label" style={{ color: statColor }}>
            of Admissions
          </div>
          <div className="stat-trend-row">
            {getChangeArrow(admitChange)}
            {admitChange} · <span className="stat-date">{admitDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
