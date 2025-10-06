import React, { useMemo } from "react";
import { getThemeByTitle } from "../utils/themeUtils";
import {
  getTrendFromTimeSeries,
  normalizePercentChange,
  getTrendDirection,
} from "../utils/trendUtils";
import "./StatCardBottom.css";

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

const StatCardBottom = ({
  title,
  series,
  valueKey = "value",
  visitChange,   // legacy fallback
  visitPercent,  // (unused here; kept for compatibility)
}) => {
  const theme = getThemeByTitle(title);

  // Normalize trend object
  const trend = useMemo(() => {
    if (Array.isArray(series) && series.length >= 2) {
      return getTrendFromTimeSeries(series, valueKey);
    }
    const n = normalizePercentChange(visitChange);
    if (n == null) return null;
    const dir = getTrendDirection(n);
    return dir === "same"
      ? { label: "not changed", value: "0%", direction: "same" }
      : { label: n > 0 ? "increased" : "decreased", value: `${Math.abs(n)}%`, direction: dir };
  }, [series, valueKey, visitChange]);

  const dir = trend?.direction ?? null;

  // Percent string shown inside the chip
  const displayPercent = useMemo(() => {
    if (!trend) return null;
    if (dir === "same") return "0%";
    const n = extractNumberFromPercent(trend.value);
    return Number.isFinite(n) ? `${Math.abs(n)}%` : null;
  }, [trend, dir]);

  return (
    <div
      className="stat-card-bottom"
      style={{ "--card-bg": theme.background, "--stat-value": theme.color }}
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
        <div className="stat-detail-bottom">
          <div className="stat-trend-row-bottom">
            {trend && <TrendChip dir={dir} percent={displayPercent} />}
            {/* removed the separate .stat-percent-change element */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCardBottom;
