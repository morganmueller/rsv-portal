import React, { useMemo } from "react";
import { getThemeByTitle } from "../utils/themeUtils";
import {
  getTrendFromTimeSeries,
  normalizePercentChange,
  getTrendDirection,
} from "../utils/trendUtils";
import "./StatCard.css";

/** Arrow + direction label on top row; percent on its own line inside the chip */
const TrendChip = ({ dir, percent }) => {
  if (dir === null) return null;

  const map = {
    up:   { cls: "trend-increasing", arrow: "▲", label: "Increasing" },
    down: { cls: "trend-decreasing", arrow: "▼", label: "Decreasing" },
    same: { cls: "trend-nochange",   arrow: "→", label: "No change"  },
  };
  const { cls, arrow, label } = map[dir] ?? map.same;

  return (
    <span className={`trend-chip ${cls}`}>
      <span className="chip-top">
        <span className="stat-arrow" aria-hidden="true">{arrow}</span>
        <span className="chip-label">{label}</span>
      </span>
      {percent && <span className="chip-value">{percent}</span>}
    </span>
  );
};

function extractNumberFromPercent(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const m = value.match(/-?\d+(\.\d+)?/);
    return m ? Number(m[0]) : null;
  }
  return null;
}

const StatCard = ({
  title,
  series,             // time series for this card
  valueKey = "value", // which field holds the numeric level
  visitPercent,       // legacy fallback
  visitChange,        // legacy fallback (raw %)
  infoText,
}) => {
  const theme = getThemeByTitle(title);
  const iconSrc = theme.icon || null;
  const isOverallARI = /overall respiratory|ari visits|acute respiratory/i.test(title);

  const level = useMemo(() => {
    if (Array.isArray(series) && series.length) {
      const raw = series.at(-1)?.[valueKey];
      const n = typeof raw === "string" ? Number(raw.replace(/[%\s,]+/g, "")) : Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    return typeof visitPercent === "number" ? visitPercent : null;
  }, [series, valueKey, visitPercent]);

  // Compute WoW trend from series when possible; otherwise fall back to visitChange
  const trend = useMemo(() => {
    if (Array.isArray(series) && series.length >= 2) {
      return getTrendFromTimeSeries(series, valueKey);
    }
    const n = normalizePercentChange(visitChange);
    if (n === null) return null;
    const dir = getTrendDirection(n);
    return dir === "same"
      ? { label: "not changed", value: "0%", direction: "same" }
      : {
          label: n > 0 ? "increased" : "decreased",
          value: `${Math.abs(n)}%`,
          direction: dir,
        };
  }, [series, valueKey, visitChange]);

  const dir = trend?.direction ?? null;

  // Percent string to show inside the chip
  const displayPercent = useMemo(() => {
    if (!trend) return null;
    if (dir === "same") return null;
    const n = extractNumberFromPercent(trend.value);
    return Number.isFinite(n) ? `${Math.abs(n)}%` : null;
  }, [trend, dir]);

  return (
    <div
      className="stat-card"
      tabIndex={0}
      aria-label={`${title} stat card`}
      style={{ "--card-bg": theme.background, "--stat-value": theme.color }}
    >
      <div className="stat-card-header">
        {iconSrc && (
          <img className="stat-card-icon" src={iconSrc} alt="" aria-hidden="true" loading="lazy" />
        )}
        <div className="statcard-title">{title}</div>
      </div>

      <div className={`stat-card-body ${isOverallARI ? "ari-card-body" : ""}`}>
        <div className="stat-percent">
          {Number.isFinite(level) ? `${level}%` : ""}
        </div>

        {trend && (
          <div className={`stat-percent-change-col ${isOverallARI ? "left-align" : ""}`}>
            <div className="stat-trend-row">
              <TrendChip dir={dir} percent={displayPercent} />
            </div>
            {/* removed the separate .stat-change-number element */}
          </div>
        )}

        {isOverallARI && infoText && <div className="stat-right-text">{infoText}</div>}
      </div>
    </div>
  );
};

export default StatCard;
