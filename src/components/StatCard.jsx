import React from "react";
import colors from "../styles/colors";
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
  backgroundColor = colors.gray100,
}) => {
  const themeColors = {
    "COVID-19": colors.bluePrimary,
    "Influenza": colors.purplePrimary,
    "RSV": colors.greenPrimary,
    "ARI": colors.orangePrimary,
    "Acute Respiratory Infections": colors.orangePrimary,
  };

  const statColor = themeColors[title] || colors.gray800;

  const getChangeArrow = (change) => {
    const num = parseFloat(change);
    const isUp = num >= 0;
    const arrow = isUp ? "▲" : "▼";
    const color = isUp ? colors.orangeAccent : colors.greenMuted;
    return <span style={{ color, marginRight: 4 }}>{arrow}</span>;
  };

  return (
    <div className="stat-card" style={{ backgroundColor }}>
      <div className="stat-card-header">
        {icon && <img className="stat-card-icon" src={icon} alt={`${title} icon`} />}
        <div className="stat-card-title">{title}</div>
      </div>

      <div className="stat-block">
        <div className="stat-percent" style={{ color: statColor }}>{visitPercent}</div>
        <div className="stat-detail">
          <div className="stat-label">of emergency dept visits</div>
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
          <div className="stat-label">of emergency dept admissions</div>
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
