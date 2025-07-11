import React from "react";
import { getThemeByTitle } from "../utils/themeUtils";
import { tokens } from "../styles/tokens";
import "./StatCard.css";

const { colors, typography } = tokens;

const StatCard = ({
  title,
  icon,
  visitPercent,
  hospitalizationPercent,
  visitChange,
  admitChange,
  visitDate,
  admitDate,
}) => {
  const { color: statColor, background: cardBackground, icon: defaultIcon} = getThemeByTitle(title);
  const iconSrc = icon || defaultIcon;

  const getChangeArrow = (change) => {
    const num = parseFloat(change);
    if (isNaN(num)) return null;
  
    const epsilon = 0.001; // tolerance for what counts as no change
    const isNoChange = Math.abs(num) < epsilon;
  
    if (isNoChange) {
      return <span style={{ color: colors.gray900, marginRight: 1 }}>Not changing</span>;
    }
  
    const isUp = num > 0;
    const trend = isUp ? "Increasing" : "Decreasing";
    const color = colors.gray900;
  
    return <span style={{ color, marginRight: 1 }}>{trend}</span>;
  };
  

  return (
    <div className="stat-card" style={{ backgroundColor: cardBackground }}>
      <div className="stat-card-header">
        {iconSrc && <img className="stat-card-icon" src={iconSrc} alt={`${title} icon`} />}
        <div className="stat-card-title">{title}</div>
      </div>

      <div className="stat-block">
        <div className="stat-detail">
          <div className="stat-trend-row">
          {visitChange !== null && (
  <>
    {getChangeArrow(visitChange)}
    {Math.abs(visitChange)}% 
    {/* · <span className="stat-date">{visitDate}</span> */}
  </>
)}  </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
