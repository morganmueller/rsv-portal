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

export function getTrendFromTimeSeries(data, key) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const current = data.at(-1)?.[key];
  const previous = data.at(-2)?.[key];

  if (typeof current !== "number" || typeof previous !== "number") return null;

  // Division-by-zero case → direction only; DO NOT return null text
  if (previous === 0) {
    if (current === 0) {
      return { label: "not changed", value: "0%", direction: "same" };
    }
    return { label: "increased", value: "", direction: "up" }; // ← was null
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
// utils/trendUtils.js

export function formatTrendPhrase(
  change,
  { withBy = true, withPercent = true } = {}
) {
  if (!change || !change.label) return "";

  const v = change.value;
  const isZeroString = typeof v === "string" && v.trim() === "0%";
  const isZeroNumber = typeof v === "number" && v === 0;
  const isEmpty = v == null || (typeof v === "string" && v.trim() === "");

  // Any of these → present as "not changed"
  if (change.label === "not changed" || isZeroString || isZeroNumber || isEmpty) {
    return "not changed";
  }

  const parts = [change.label];

  if (typeof v === "string" && v.trim() !== "") {
    if (withBy) parts.push("by");
    parts.push(v.trim()); // already includes %
  } else if (typeof v === "number" && Number.isFinite(v) && v !== 0) {
    if (withBy) parts.push("by");
    parts.push(withPercent ? `${Math.abs(v)}%` : String(Math.abs(v)));
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
  const isZeroString = typeof trendObj.value === "string" && trendObj.value.trim() === "0%";
  const isZeroNumber = typeof trendObj.value === "number" && trendObj.value === 0;

  // Force "not changed" whenever value is zero, regardless of label
  const isNoChangeLabel = trendObj.label?.toLowerCase() === "not changed";
  const shouldBeNoChange = isNoChangeLabel || isZeroString || isZeroNumber;

  if (shouldBeNoChange) {
    return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have not changed since the previous week.`;
  }

  // Otherwise, include the number if present
  const dirText = trendObj.label?.toLowerCase() || "changed";
  let valueText = "";
  if (typeof trendObj.value === "string" && trendObj.value.trim() !== "") {
    valueText = ` ${trendObj.value.trim()}`;
  } else if (typeof trendObj.value === "number" && Number.isFinite(trendObj.value) && trendObj.value !== 0) {
    valueText = ` ${Math.abs(trendObj.value)}%`;
  }

  return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have ${dirText}${valueText} since the previous week.`;
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
      console.log("data[graph]", data[graph])
      const dates = data[graph]
      console.log("dates", dates)
      if (!dates || dates.length === 0) {
        return null; // Handle empty or invalid input
      }
      for(const [key, value] of Object.entries(dates)){
        // console.log("key", key)
        console.log("value", value)
        let currentDate
        if(Array.isArray(value)){
          for(let i = 0; i < value.length; i++){
            currentDate = new Date(value[i]["date"])
            console.log("currentDate inside home page")
          }
        } else {
          currentDate = new Date(value["date"]);
          console.log("currentDate on ancillary pages")
        }
      
          console.log("currentDate", currentDate)
          if(latestDate < currentDate){
            latestDate = currentDate
          }
        }
    }
  }
  console.log("latestDate at end", latestDate)
  const formattedDate = latestDate
  ? new Date(latestDate).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
  : null;
  return formattedDate
}