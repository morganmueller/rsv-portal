/** =====================================================================
 * Local-date parsing (timezone-safe)
 * =================================================================== */

/** Parse "MM/DD/YYYY" as LOCAL midnight. */
function parseLocalMDY(mdy) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(mdy || ""));
  if (!m) return null;
  const [, mmStr, ddStr, yyyyStr] = m;
  const mm = Number(mmStr);
  const dd = Number(ddStr);
  const yyyy = Number(yyyyStr);
  if (!Number.isFinite(mm) || !Number.isFinite(dd) || !Number.isFinite(yyyy)) return null;
  return new Date(yyyy, mm - 1, dd); // local midnight
}

/** Parse "YYYY-MM-DD" OR "MM/DD/YYYY" as LOCAL midnight (avoid UTC shifting a day). */
export function parseLocalISO(isoLike) {
  if (!isoLike) return null;
  if (isoLike instanceof Date && !Number.isNaN(isoLike.getTime())) return isoLike;

  const s = String(isoLike);

  // ISO first: YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const [, yStr, mmStr, ddStr] = iso;
    const y = Number(yStr);
    const mm = Number(mmStr);
    const dd = Number(ddStr);
    if (Number.isFinite(y) && Number.isFinite(mm) && Number.isFinite(dd)) {
      return new Date(y, mm - 1, dd); // local midnight
    }
  }

  // Explicit MDY: MM/DD/YYYY
  const mdy = parseLocalMDY(s);
  if (mdy) return mdy;

  // Final fallback (last resort)
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** =====================================================================
 * Percent change + trend helpers
 * =================================================================== */

/** Shared epsilon: treat |Δ| < 1% as "no change" everywhere */
export const EPSILON_NO_CHANGE = 1;

/** Parse numbers like "  -0.8 %", "2%", "3", 4 → finite number or null */
function coercePercentNumber(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Numeric coercion for row values (number or stringified number). Treat blanks as 0. */
const toNum = (v) => {
  if (v == null || v === "") return 0; // 👈 key change
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.trim();
    if (cleaned === "" || cleaned.toLowerCase() === "na") return 0;
    const n = Number(cleaned.replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

/** 
 * Return the last two weeks of data with numeric values. 
 * Missing or blank values are treated as 0.
 */
export function getLastTwoWeeks(data = [], key = "value") {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Normalize and sort chronologically
  const normalized = data
    .map(d => ({
      ...d,
      date: parseLocalISO(d.date ?? d.week ?? d._dateRaw ?? d.dateStr),
      [key]: toNum(d[key]),
    }))
    .filter(d => d.date instanceof Date && !Number.isNaN(d.date))
    .sort((a, b) => a.date - b.date);

  // Take the last two (most recent) weeks
  const lastTwo = normalized.slice(-2);

  // Pad with a zero-value week if only one exists
  if (lastTwo.length === 1) {
    const prevDate = new Date(lastTwo[0].date);
    prevDate.setDate(prevDate.getDate() - 7);
    lastTwo.unshift({ ...lastTwo[0], date: prevDate, [key]: 0 });
  }

  return lastTwo;
}


/**
 * Get the last two numeric values for the SAME series, where a "series" is defined
 * by matching `metricKey` and `submetricKey`. We:
 *   1) Find the most recent numeric row (current), record its metric/submetric
 *   2) Scan backward for the previous numeric row with the same metric/submetric
 * Returns [current, previous] or null.
 */
export function getLastTwoValuesSameSeries(
  data,
  key = "value",
  {
    metricKey = "metric",
    submetricKey = "submetric",
    // set these per dataset:
    forceTotal = false,        // true for cases/deaths
    metricOnly = false,        // true for ED visits/admissions (overall)
    totalValues = ["Total", "All", "Overall"], // what counts as "total"
  } = {}
) {
  if (!Array.isArray(data) || data.length < 2) return null;

  const norm = (x) => {
    if (x == null) return null;
    const s = String(x).trim();
    if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return null;
    // strip one pair of wrapping quotes
    return s.replace(/^(['"])(.*)\1$/, "$2").trim();
  };

  const isTotal = (x) => {
    const v = norm(x);
    if (!v) return false;
    const low = v.toLowerCase();
    return totalValues.some((t) => low === String(t).toLowerCase());
  };

  // --- pick the "current" row according to the mode ---
  let lastIdx = -1;
  let lastV = null;
  let lastMetric = null;
  let lastSub = null;

  // Scan from the end once; choose by priority:
  // 1) forceTotal: last numeric row whose submetric is in totalValues
  // 2) else: last numeric row (any)
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const v = toNum(row?.[key]);
    if (v === null) continue;

    if (forceTotal) {
      if (!isTotal(row?.[submetricKey])) continue; // only totals
    }

    lastIdx = i;
    lastV = v;
    lastMetric = norm(row?.[metricKey]);
    lastSub = norm(row?.[submetricKey]);
    break;
  }
  if (lastIdx < 0) return null;

  // --- find the previous row that matches the same series by mode ---
  for (let j = lastIdx - 1; j >= 0; j--) {
    const row = data[j];
    const vPrev = toNum(row?.[key]);
    if (vPrev === null) continue;

    const m = norm(row?.[metricKey]);
    const s = norm(row?.[submetricKey]);

    // Matching strategy
    if (metricOnly) {
      // ED overall: match ONLY on metric
      if (m === lastMetric) return [lastV, vPrev];
    } else if (forceTotal) {
      // Cases/Deaths: must be same metric AND "total" submetric
      if (m === lastMetric && isTotal(s)) return [lastV, vPrev];
    } else {
      // Default: same metric + same submetric
      if (m === lastMetric && s === lastSub) return [lastV, vPrev];
    }
  }

  // Nothing matched
  return null;
}

/** Compute WoW % change number from the SAME series (last two rows). Returns raw percent. */
export function getWoWPercentChange(series, key = "value") {
  if (!Array.isArray(series) || series.length < 2) return null;
  const pair = getLastTwoValuesSameSeries(series, key);
  if (!pair) return null;
  const [curr, prev] = pair;
  if (!Number.isFinite(curr) || !Number.isFinite(prev)) return null;
  if (prev === 0) return curr === 0 ? 0 : 100; // direction-only case
  return ((curr - prev) / prev) * 100;
}

/** Same as above but normalized for display (|Δ| < 1% → 0, otherwise rounded). */
export function getWoWPercentChangeDisplay(series, key = "value") {
  const raw = getWoWPercentChange(series, key);
  return normalizePercentChange(raw);
}

/** Returns true if raw % change should be treated as "no change" (< 1%). */
export function isNoChange(raw) {
  const n = coercePercentNumber(raw);
  return n === null ? false : Math.abs(n) < EPSILON_NO_CHANGE;
}

/** Normalize a raw % change for display. */
export function normalizePercentChange(raw) {
  const n = coercePercentNumber(raw);
  if (n === null) return null;
  return Math.abs(n) < EPSILON_NO_CHANGE ? 0 : Math.round(n);
}

/** Direction from the (same) numeric value you display. */
export function getTrendDirection(raw) {
  const n = coercePercentNumber(raw);
  if (n === null) return null;
  if (Math.abs(n) < EPSILON_NO_CHANGE) return "same";
  return n > 0 ? "up" : "down";
}

/** Formats a raw change like 0.6 → "0%", 4.4 → "4%". */
export function formatPercentChange(raw) {
  const n = normalizePercentChange(raw);
  return n === null ? null : `${Math.abs(n)}%`;
}

/** ===== Time-series → trend object ===== */

export function getTrendFromTimeSeries(data, key = "value") {
  if (!Array.isArray(data) || data.length < 2) return null;

  const pair = getLastTwoValuesSameSeries(data, key);
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

  if (Math.abs(rawChangePct) < EPSILON_NO_CHANGE) {
    return { label: "not changed", value: "0%", direction: "same" };
  }

  const rounded = Math.round(rawChangePct);
  return rounded > 0
    ? { label: "increased", value: `${rounded}%`, direction: "up" }
    : { label: "decreased", value: `${Math.abs(rounded)}%`, direction: "down" };
}

/** =====================================================================
 * Formatting utilities
 * =================================================================== */

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

export function formatDate(input) {
  // Accept Date, "YYYY-MM-DD", "MM/DD/YYYY", or anything Date can parse; prefer local parsing.
  const d =
    parseLocalISO(input?.dateStr ?? input) // allow objects with {dateStr}
    ?? (input?.date instanceof Date ? input.date : null) // allow {date}
    ?? (input?.dateObj instanceof Date ? input.dateObj : null); // allow {dateObj}
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", {
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
  const tagRegex = /(<[^>]+>)*([^<])/;
  const match = str.match(tagRegex);
  if (!match) return str;
  const index = str.indexOf(match[2]);
  return str.slice(0, index) + match[2].toUpperCase() + str.slice(index + 1);
}

/** Build a compact phrase from a trend object (e.g., "increased by 4%"). */
export function formatTrendPhrase(
  change,
  { withBy = true, withPercent = true } = {}
) {
  if (!change || !change.label) return "";
  const label = change.label.toLowerCase();
  const vRaw = change.value;
  const vStr = typeof vRaw === "string" ? vRaw.trim() : vRaw;

  if (label === "not changed") return "not changed";
  if ((typeof vStr === "string" && vStr === "0%") || (typeof vStr === "number" && vStr === 0)) {
    return "not changed";
  }

  const parts = [change.label];

  const isEmpty = vStr == null || (typeof vStr === "string" && vStr === "");
  if (isEmpty) return parts.join(" "); // direction-only (no number)

  // Accept numeric with or without "%": "12" | "12%"
  const numericLike = typeof vStr === "string" && /^[-+]?\d+(?:\.\d+)?%?$/.test(vStr);
  if (numericLike) {
    const n = Math.abs(parseFloat(String(vStr).replace("%", "")));
    if (Number.isFinite(n) && n !== 0) {
      if (withBy) parts.push("by");
      parts.push(withPercent ? `${n}%` : String(n));
    }
    return parts.join(" ");
  }

  if (typeof vStr === "string") {
    if (withBy) parts.push("by");
    parts.push(vStr);
  } else if (typeof vStr === "number" && Number.isFinite(vStr) && vStr !== 0) {
    if (withBy) parts.push("by");
    parts.push(withPercent ? `${Math.abs(vStr)}%` : String(Math.abs(vStr)));
  }

  return parts.join(" ");
}

/** Build a full, human-readable subtitle. */
export function generateTrendSubtitle({ view, trendObj, latestWeek }) {
  if (!trendObj || typeof trendObj !== "object") return null;

  const metric = view === "hospitalizations" ? "hospitalizations" : (view || "visits");
  const phrase = formatTrendPhrase(trendObj, { withBy: true, withPercent: true });

  if (!phrase || phrase === "not changed") {
    return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have not changed since the previous week.`;
  }

  return `${capitalize(metric)} for the week ending ${formatDate(latestWeek)} have ${phrase} since the previous week.`;
}

/** =====================================================================
 * “Latest week” helpers — timezone-safe
 * =================================================================== */

export function getLatestWeekFromData(data = []) {
  if (!Array.isArray(data) || data.length === 0) return "N/A";
  const last = data.at(-1) || {};

  // Prefer explicit fields if present (compatible with both filterMetricData variants)
  const candidate =
    last.dateStr ??
    last.week ??
    last._dateRaw ??
    last.date ?? null;

  const d = parseLocalISO(candidate);
  if (!d) return "N/A";
  // Return a Date (local midnight) to avoid UTC string re-parsing issues downstream
  return d;
}

/** Find the latest date across an array or object-of-arrays of rows. */
export function getLatestWeek(buckets) {
  const arrays = Array.isArray(buckets) ? [buckets] : Object.values(buckets || {});
  let bestTs = -Infinity;

  for (const arr of arrays) {
    if (!Array.isArray(arr)) continue;
    for (const row of arr) {
      const candidate = row?.dateStr ?? row?._dateRaw ?? row?.date ?? row?.week;
      const d = parseLocalISO(candidate);
      const ts = d ? d.getTime() : -Infinity;
      if (ts > bestTs) bestTs = ts;
    }
  }

  if (bestTs === -Infinity) return null;
  const d = new Date(bestTs);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
}

// Ensure zero-valued changes render as "not changed"
export function coerceNoChange(trendObj) {
  if (!trendObj || typeof trendObj !== "object") return trendObj;

  const v = trendObj.value;
  const isZeroString = typeof v === "string" && v.trim() === "0%";
  const isZeroNumber = typeof v === "number" && v === 0;

  if (
    isZeroString ||
    isZeroNumber ||
    String(trendObj.label || "").toLowerCase() === "not changed" ||
    trendObj.direction === "same"
  ) {
    return { ...trendObj, label: "not changed", value: "0%", direction: "same" };
  }

  return trendObj;
}

/** Detect if the last row is the first week of the (Sep-starting) season. */
export function isFirstWeekFromData(data = []) {
  if (!Array.isArray(data) || data.length === 0) return false;

  const last = data.at(-1);
  const dateRaw = last?.dateStr ?? last?._dateRaw ?? last?.date ?? last?.week;
  const rowDate = parseLocalISO(dateRaw);
  if (!rowDate) return false;

  // Infer week-end DOW from recent rows (default Saturday)
  const inferEndDOW = () => {
    const counts = new Map();
    for (let i = data.length - 1, seen = 0; i >= 0 && seen < 6; i--) {
      const dRaw = data[i]?.dateStr ?? data[i]?._dateRaw ?? data[i]?.date ?? data[i]?.week;
      const d = parseLocalISO(dRaw);
      if (d) {
        counts.set(d.getDay(), (counts.get(d.getDay()) || 0) + 1);
        seen++;
      }
    }
    if (counts.size === 0) return 6; // Saturday
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };

  const endDOW = inferEndDOW();
  const y = rowDate.getFullYear();
  const sep1 = new Date(y, 8, 1); // Sep 1
  const offset = (endDOW - sep1.getDay() + 7) % 7;
  const firstWeekEnd = new Date(y, 8, 1 + offset);

  return rowDate.getTime() === firstWeekEnd.getTime() && rowDate.getMonth() === 8;
}
