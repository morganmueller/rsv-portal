import React from "react";
import { getThemeByTitle } from "../utils/themeUtils";
import { normalizePercentChange, getTrendDirection } from "../utils/trendUtils";
import "./StatCardBottom.css";

const TrendChip = ({ rawChange }) => {
  const dir = getTrendDirection(rawChange);
  if (dir === null) return null;

  if (dir === "same") {
    return (
      <span className="trend-nochange">
        <span className="stat-arrow">→</span>
        No change
      </span>
    );
  }
  if (dir === "up") {
    return (
      <span className="trend-increasing">
        <span className="stat-arrow">▲</span>
        Increasing
      </span>
    );
  }
  return (
    <span className="trend-decreasing">
      <span className="stat-arrow">▼</span>
      Decreasing
    </span>
  );
};

const StatCardBottom = ({
  title,
  visitChange,   // WoW delta (%)
  visitPercent,  // optional current level (hidden by default in compact)
}) => {
  const theme = getThemeByTitle(title);
  const normalizedChange = normalizePercentChange(visitChange);

  return (
    <div
      className="stat-card-bottom"
      style={{
        "--card-bg": theme.background,
        "--stat-value": theme.color,
      }}
      aria-label={`${title} stat card (compact)`}
    >
      <div className="stat-card-header-bottom">
        {theme.icon && (
          <img
            className="stat-card-icon-bottom"
            src={theme.icon}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        )}
        <div className="stat-card-title-bottom">{title}</div>
      </div>

      <div className="stat-block-bottom">
        {/* Optional: show level, rounded to whole numbers if desired
        <div className="stat-percent-bottom">
          {Number.isFinite(+visitPercent) ? `${Math.round(visitPercent)}%` : ""}
        </div>
        */}
        <div className="stat-detail-bottom">
          <div className="stat-trend-row-bottom">
            {normalizedChange !== null && (
              <>
                <TrendChip rawChange={visitChange} />
                {getTrendDirection(visitChange) !== "same" && (

                <span className="stat-percent-change">
                  {Math.abs(normalizedChange)}%
                </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCardBottom;
