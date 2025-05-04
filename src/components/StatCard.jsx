import React from "react";
import colors from "../styles/colors";
import "./StatCard.css";

const StatCard = ({
  title,
  year,
  icon,
  visitPercent,
  admitPercent,
  visitChange,
  admitChange,
  visitIcon,
  admitIcon,
  subtitle,
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
    return <span style={{ color, marginLeft: 4 }}>{arrow}</span>;
  };

  return (
    <div className="stat-card" style={{ backgroundColor }}>
      <div className="stat-card-header">
        {icon && <img className="stat-card-icon" src={icon} alt={`${title} icon`} />}
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-year">{year}</div>
      </div>

      <div className="stat-subtitle">{subtitle}</div>

      <div className="stat-columns">
        <div className="stat-column">
          <div className="stat-percent" style={{ color: statColor }}>
            {visitPercent}
          </div>
          <div className="stat-label">Visits</div>
          <div className="stat-change">
          {getChangeArrow(visitChange)}
            {visitChange}
          </div>
        </div>
        <div className="stat-column">
          <div className="stat-percent" style={{ color: statColor }}>
            {admitPercent}
          </div>
          <div className="stat-label">Admits</div>
          <div className="stat-change">
          {getChangeArrow(admitChange)}

            {admitChange}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
