// utils/trendUtils.js

/** ===== Percent-change helpers (shared across cards, subtitles, etc.) ===== */

/** Returns true if the raw % change should be treated as "no change" (< 1%). */
export function isNoChange(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) < 1;
}

/**
 * Normalize a raw % change for display:
 *  - If |Δ| < 1 → 0 (no change)
 *  - Else round to nearest whole number
 * Returns null if input is not finite.
 */
export function normalizePercentChange(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return isNoChange(n) ? 0 : Math.round(n);
}

/**
 * Direction from raw (unrounded) % change.
 * Returns: 'same' | 'up' | 'down' | null
 */
export function getTrendDirection(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (isNoChange(n)) return "same";
  return n > 0 ? "up" : "down";
}

/** Formats a raw change like 0.6 → "0%", 4.4 → "4%". Returns null if not finite. */
export function formatPercentChange(raw) {
  const n = normalizePercentChange(raw);
  return n === null ? null : `${Math.abs(n)}%`;
}

/** ===== Time-series → trend object ===== */

/**
 * Compute week-over-week trend from a time series' last two rows.
 * Enforces: |Δ| < 1% ⇒ "not changed" (direction "same"), otherwise rounds to whole %.
 * If previous == 0, returns direction without a percent value.
 *
 * Returns: { label: "increased"|"decreased"|"not changed", value: string|null, direction: "up"|"down"|"same" }
 * - value is a string like "4%" or "0%" or null (when not computable or prev==0 with positive current)
 */
// utils/trendUtils.js

// utils/trendUtils.js
const toNum = v => {
  const n = typeof v === "string" ? Number(v.trim()) : Number(v);
  return Number.isFinite(n) ? n : null;
};

const getLastTwoValues = (data, key) => {
  const vals = [];
  for (let i = data.length - 1; i >= 0 && vals.length < 2; i--) {
    const v = toNum(data[i]?.[key]);
    if (v !== null) vals.push(v);
  }
  return vals.length === 2 ? [vals[0], vals[1]] : null; // [current, previous]
};

export function getTrendFromTimeSeries(data, key) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const pair = getLastTwoValues(data, key);
  if (!pair) return null;

  const [current, previous] = pair;

  if (previous === 0) {
    if (current === 0) {
      return { label: "not changed", value: "0%", direction: "same" };
    }
    // Direction only; no numeric percent
    return { label: "increased", value: "", direction: "up" };
  }

  const rawChangePct = ((current - previous) / previous) * 100;

  if (Math.abs(rawChangePct) < 1) {
    return { label: "not changed", value: "0%", direction: "same" };
  }

  const rounded = Math.round(rawChangePct);
  return rounded > 0
    ? { label: "increased", value: `${rounded}%`, direction: "up" }
    : { label: "decreased", value: `${Math.abs(rounded)}%`, direction: "down" };
}


/** ===== Formatting utilities ===== */

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

export function capitalizeFirstHtml(str) {
  if (!str) return str;
  // Find the first visible character that is not inside a tag
  const tagRegex = /(<[^>]+>)*([^<])/;
  const match = str.match(tagRegex);
  if (!match) return str;

  const index = str.indexOf(match[2]);
  return str.slice(0, index) + match[2].toUpperCase() + str.slice(index + 1);
}

/**
 * Build a compact phrase from a trend object (e.g., "increased by 4%").
 * - Omits the numeric part if value is null/empty.
 * - Accepts value as number or string with %.
 */
export function formatTrendPhrase(
  change,
  { withBy = true, withPercent = true } = {}
) {
  if (!change || !change.label) return "";

  const label = change.label.toLowerCase();
  const vRaw = change.value;
  const vStr = typeof vRaw === "string" ? vRaw.trim() : vRaw;

  // Only the label controls the “not changed” text
  if (label === "not changed") return "not changed";

  // If the value is exactly 0 (number or "0%"), treat as not changed.
  const isZeroString = typeof vStr === "string" && vStr === "0%";
  const isZeroNumber = typeof vStr === "number" && vStr === 0;
  if (isZeroString || isZeroNumber) return "not changed";

  const parts = [change.label];

  // Empty value means direction-only phrase (e.g., “increased”)
  const isEmpty = vStr == null || (typeof vStr === "string" && vStr === "");
  if (isEmpty) return parts.join(" ");

  // Coerce numeric-looking strings to number, then add %
  const looksNumericString = typeof vStr === "string" && /^[-+]?\d+(?:\.\d+)?$/.test(vStr);
  if (looksNumericString) {
    const n = Number(vStr);
    if (n !== 0) {
      if (withBy) parts.push("by");
      parts.push(withPercent ? `${Math.abs(n)}%` : String(Math.abs(n)));
    }
    return parts.join(" ");
  }

  if (typeof vStr === "string") {
    if (withBy) parts.push("by");
    parts.push(vStr); // already formatted, e.g., "5%"
  } else if (typeof vStr === "number" && Number.isFinite(vStr) && vStr !== 0) {
    if (withBy) parts.push("by");
    parts.push(withPercent ? `${Math.abs(vStr)}%` : String(Math.abs(vStr)));
  }

  return parts.join(" ");
}



/**
 * Build a full, human-readable subtitle.
 * Input:
 *  - view: "visits" | "hospitalizations"
 *  - trendObj: { label, value (string|null|number), direction }
 *  - latestWeek: ISO or date parsable string
 *
 * Output:
 *  "Visits for the week ending August 8, 2025 have increased by 4% since the previous week."
 *  If value is null (e.g., prev==0): "…have increased since the previous week."
 *  If trend is not available: returns null (caller can hide subtitle or show fallback).
 */
export function generateTrendSubtitle({ view, trendObj, latestWeek }) {
  if (!trendObj || typeof trendObj !== "object") return null;

  const metric = view === "hospitalizations" ? "hospitalizations" : "visits";

  // Use the shared formatter so % and "by" are always consistent
  const phrase = formatTrendPhrase(trendObj, { withBy: true, withPercent: true });

  if (!phrase || phrase === "not changed") {
    return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have not changed since the previous week.`;
  }

  return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have ${phrase} since the previous week.`;
}


export function coerceNoChange(trendObj) {
  if (!trendObj) return trendObj;
  const isZeroString = typeof trendObj.value === "string" && trendObj.value.trim() === "0%";
  const isZeroNumber = typeof trendObj.value === "number" && trendObj.value === 0;
  if (isZeroString || isZeroNumber) {
    return { ...trendObj, label: "not changed", direction: "same" };
  }
  return trendObj;
}


/** ===== UI helpers for trend badges/text ===== */

export const getTrendInfo = ({ trendDirection, metricLabel, virus }) => {
  if (!trendDirection) return null;

  // Accept "same", legacy "neutral", and "none" as no-change
  const dir =
    trendDirection === "neutral" || trendDirection === "none"
      ? "same"
      : trendDirection;

  const colorMap = {
    up: "var(--red-accent)",
    down: "var(--green-muted)",
    same: "var(--black)",
  };

  const arrowMap = {
    up: "▲",
    down: "▼",
    same: "●", // or ""
  };

  const directionTextMap = {
    up: "higher than last week",
    down: "lower than last week",
    same: "the same as last week",
  };

  return {
    trendColor: colorMap[dir],
    arrow: arrowMap[dir],
    directionText: directionTextMap[dir],
    label: `${virus} ${metricLabel} are `,
  };
};

export function getLatestWeekFromData(data = []) {
  if (!Array.isArray(data) || data.length === 0) return "N/A";
  const lastRow = data.at(-1) || {};
  return lastRow.week || lastRow.date || "N/A";
}

export function getLatestWeek(data){
  let latestDate = new Date("2020-01-01T00:00:00")
  if(!data){
    return ""
  } else {
    for(const graph in data){
      const dates = data[graph]
      if (!dates || dates.length === 0) {
        return null; // Handle empty or invalid input
      }
      for(const [key, value] of Object.entries(dates)){
        // console.log("key", key)
        let currentDate
        if(Array.isArray(value)){
          for(let i = 0; i < value.length; i++){
            currentDate = new Date(value[i]["date"]);
          }
        } else {
          currentDate = new Date(value["date"]);
        }
      
          if(latestDate < currentDate){
            latestDate = currentDate
          }
        }
    }
  }
  const formattedDate = latestDate
  ? new Date(latestDate).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  : null;
  return formattedDate
}

export function isFirstWeekFromData(data = []) {
  // Always return a boolean. Never return strings like "N/A".
  if (!Array.isArray(data) || data.length === 0) return false;

  const last = data.at(-1);
  const dateStr = last?.week || last?.date;
  if (!dateStr) return false;

  const rowDate = new Date(dateStr);
  if (Number.isNaN(rowDate.getTime())) return false;

  // Infer the week-end day-of-week from the most recent few rows (default to Saturday).
  const inferEndDOW = () => {
    const counts = new Map();
    for (let i = data.length - 1, seen = 0; i >= 0 && seen < 6; i--) {
      const dStr = data[i]?.week || data[i]?.date;
      const d = dStr ? new Date(dStr) : null;
      if (d && !Number.isNaN(d.getTime())) {
        const dow = d.getDay(); // 0=Sun ... 6=Sat (JS)
        counts.set(dow, (counts.get(dow) || 0) + 1);
        seen++;
      }
    }
    if (counts.size === 0) return 6; // fallback: Saturday
    // pick the mode
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };

  const endDOW = inferEndDOW(); // likely 6 for your CSV

  // Use the YEAR OF THE ROW, not the current year.
  const y = rowDate.getFullYear();

  // Find the first date ON/AFTER Sep 1 that lands on the inferred week-end DOW.
  const sep1 = new Date(y, 8, 1); // month 8 = September
  const offset = (endDOW - sep1.getDay() + 7) % 7;
  const firstWeekEnd = new Date(y, 8, 1 + offset);

  // “First week of the season” = that first week-end date in September.
  // If your data sometimes uses week-end dates in another month, you can drop the month check.
  const isFirstWeek =
    rowDate.getTime() === firstWeekEnd.getTime() &&
    rowDate.getMonth() === 8; // ensure it’s in September

  return Boolean(isFirstWeek);
}
