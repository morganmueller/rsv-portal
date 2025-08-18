import React from "react";
import { getThemeByTitle } from "../utils/themeUtils";
import { normalizePercentChange, getTrendDirection } from "../utils/trendUtils";
import "./StatCard.css";

const TrendChip = ({ rawChange }) => {
  const dir = getTrendDirection(rawChange);
  if (dir === null) return null;

  if (dir === "same") {
    return (
      <span className="trend-nochange">
        <span className="stat-arrow" style={{ color: "#64748b" }}>→</span>
        No change
      </span>
    );
  }
  if (dir === "up") {
    return (
      <span className="trend-increasing">
        <span className="stat-arrow" style={{ color: "#d97706" }}>▲</span>
        Increasing
      </span>
    );
  }
  return (
    <span className="trend-decreasing">
      <span className="stat-arrow" style={{ color: "#16a34a" }}>▼</span>
      Decreasing
    </span>
  );
};

const StatCard = ({ title, visitPercent, visitChange, infoText }) => {
  const theme = getThemeByTitle(title);
  const iconSrc = theme.icon || null;

  // Match ARI / Overall respiratory illness more reliably
  const isOverallARI =
    /overall respiratory|ari visits|acute respiratory/i.test(title);

  // Apply policy to the % change value
  const normalizedChange = normalizePercentChange(visitChange);

  return (
    <div
      className="stat-card"
      tabIndex={0}
      aria-label={`${title} stat card`}
      style={{
        "--card-bg": theme.background,
        "--stat-value": theme.color,
      }}
    >
      <div className="stat-card-header">
        {iconSrc && (
          <img
            className="stat-card-icon"
            src={iconSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        )}
        <div className="statcard-title">{title}</div>
      </div>

      <div className={`stat-card-body ${isOverallARI ? "ari-card-body" : ""}`}>
        {/* Left: big % (level value — keep as-is unless you also want whole-number rounding) */}
        <div className="stat-percent">
          {typeof visitPercent === "number" ? `${visitPercent}%` : ""}
          {/* To show whole numbers here too, swap for:
              {Number.isFinite(+visitPercent) ? `${Math.round(visitPercent)}%` : ""} */}
        </div>

        {/* Middle: trend + % change (whole numbers; 0% shown as “No change”) */}
        {normalizedChange !== null && (
          <div className={`stat-percent-change-col ${isOverallARI ? "left-align" : ""}`}>
            <div className="stat-trend-row">
              <TrendChip rawChange={visitChange} />
            </div>
            <span className="stat-change-number">
              {Math.abs(normalizedChange)}%
            </span>
          </div>
        )}

        {/* Right-hand descriptive text for ARI card */}
        {isOverallARI && infoText && (
          <div className="stat-right-text">{infoText}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
