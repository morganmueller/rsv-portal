
/** month in config is 1–12; convert to 0–11 internally */
const m = (mm) => Math.max(0, Math.min(11, (mm ?? 1) - 1));

export function isInSeason(dateStr, seasonCfg) {
  const d = new Date(dateStr);
  if (!(seasonCfg && seasonCfg.start && seasonCfg.end)) return false;

  // season can cross the year boundary (e.g., Oct–May)
  const start = new Date(d.getFullYear(), m(seasonCfg.start.month), seasonCfg.start.day || 1);
  const end = new Date(d.getFullYear(), m(seasonCfg.end.month), seasonCfg.end.day || 1);

  if (start <= end) {
    // normal season in same year
    return d >= start && d <= end;
  } else {
    // season spans year end: in season if after start OR before end
    return d >= start || d <= end;
  }
}

export function formatDisplayDateLong(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function getSeasonYearRange(dateStr, seasonCfg) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const startMonth = m(seasonCfg.start.month);
  const endMonth = m(seasonCfg.end.month);

  // If season starts later in the year than it ends, it spans years.
  // Use start month to decide which year to anchor.
  return startMonth > endMonth ? `${y}–${y + 1}` : `${y}–${y}`;
}

/**
 * Build the sentence using defaults or templates from config.
 * cfg:
 * - diseaseLabel: string (e.g., "influenza-associated pediatric deaths")
 * - season: { start: {month: 10, day:1}, end: {month: 5, day:31} }
 * - templates?: { inSeason: {...}, outOfSeason: {...} }
 */
export function buildSeasonalMessage({
  dateStr,
  weeklyValue,          // stringified (e.g. "0", "<5", "3")
  seasonalTotalValue,   // stringified (e.g. "0", "<5", "12")
  cfg
}) {
  const disease = cfg.diseaseLabel || "deaths";
  const inSeason = isInSeason(dateStr, cfg.season);
  const asOfDate = formatDisplayDateLong(dateStr);
  const seasonRange = getSeasonYearRange(dateStr, cfg.season);

  const t = cfg.templates || {};
  const T = {
    inSeason: {
      weeklyZero: t.inSeason?.weeklyZero
        || `There were no ${disease} reported this week.`,
      weeklyLt: t.inSeason?.weeklyLt
        || ((n) => `There were fewer than ${n} ${disease} reported this week.`),
      weeklyNum: t.inSeason?.weeklyNum
        || ((n) => `There were ${n} ${disease} reported this week.`),

      seasonToDateZero: t.inSeason?.seasonToDateZero
        || `As of ${asOfDate}, no ${disease} have been reported to the Health Department during the ${seasonRange} season.`,
      seasonToDateLt: t.inSeason?.seasonToDateLt
        || ((n) => `As of ${asOfDate}, fewer than ${n} ${disease} have been reported to the Health Department during the ${seasonRange} season.`),
      seasonToDateNum: t.inSeason?.seasonToDateNum
        || ((n) => `As of ${asOfDate}, ${n} ${disease} have been reported to the Health Department during the ${seasonRange} season.`),
    },
    outOfSeason: {
      totalZero: t.outOfSeason?.totalZero
        || `No ${disease} were reported to the Health Department during the ${seasonRange} season.`,
      totalLt: t.outOfSeason?.totalLt
        || ((n) => `Fewer than ${n} ${disease} were reported to the Health Department during the ${seasonRange} season.`),
      totalNum: t.outOfSeason?.totalNum
        || ((n) => `A total of ${n} ${disease} were reported to the Health Department during the ${seasonRange} season.`),
    }
  };

  const parseBucket = (val, { zero, lt, num }) => {
    if (val === "0") return zero;
    if (typeof val === "string" && val.startsWith("<")) {
      const n = val.slice(1);
      return lt(n);
    }
    return num(val);
  };

  if (!inSeason) {
    // Out of season: show seasonal total sentence
    return parseBucket(seasonalTotalValue, {
      zero: T.outOfSeason.totalZero,
      lt: T.outOfSeason.totalLt,
      num: T.outOfSeason.totalNum,
    });
  }

  // In season: weekly + season-to-date
  const weekly = parseBucket(weeklyValue, {
    zero: T.inSeason.weeklyZero,
    lt: T.inSeason.weeklyLt,
    num: T.inSeason.weeklyNum,
  });
  const seasonToDate = parseBucket(seasonalTotalValue, {
    zero: T.inSeason.seasonToDateZero,
    lt: T.inSeason.seasonToDateLt,
    num: T.inSeason.seasonToDateNum,
  });
  return `${weekly} ${seasonToDate}`;
}
