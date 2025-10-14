// src/utils/statCardUtils.js (or wherever you keep it)
import { toSourceVirus } from "../utils/virusMap";
import { parseLocalISO } from "../utils/trendUtils";

/**
 * Returns latest percentage value, change from previous week, and formatted date
 * for a given base metric like "ARI", "COVID", "RSV", "Flu".
 *
 * @param {Array} data - Long-form rows: { date|week, metric, submetric, value }
 * @param {string} metricBase - UI/base label, e.g. "ARI", "COVID", "RSV", "Flu"
 * @returns {{
 *   latest: string | null,
 *   change: string | null,
 *   date: string | null,
 *   admitData: { latest: string | null, change: string | null, date: string | null }
 * }}
 */
export function getStatData(data, metricBase) {
  if (!Array.isArray(data) || !metricBase) {
    return {
      latest: null,
      change: null,
      date: null,
      admitData: { latest: null, change: null, date: null },
    };
  }

  // Map UI label -> source label used in CSV (Flu -> Influenza, COVID -> COVID-19)
  const base = toSourceVirus(metricBase);

  const isOverallLike = (s) => {
    const v = String(s || "").trim().toLowerCase();
    return (
      v === "overall" ||
      v === "total" ||
      v === "all" ||
      v === "all ages" ||
      v === "all boroughs"
    );
  };

  // Some datasets put the date in .date, others in .week; prefer local parsing to avoid UTC shifts
  const toDate = (row) => {
    const d =
      parseLocalISO(row?.dateStr ?? row?._dateRaw ?? row?.date ?? row?.week) ||
      null;
    return d;
  };

  // Coerce numeric (handles strings like "12.3", "12%", " 12 ")
  const toNum = (v) => {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = Number(String(v).replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const sortByDateAsc = (a, b) => {
    const da = toDate(a)?.getTime() ?? 0;
    const db = toDate(b)?.getTime() ?? 0;
    return da - db;
  };

  const formatAsOf = (row) => {
    const d = toDate(row);
    if (!d) return null;
    return `as of ${d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}`;
  };

  const seriesFor = (kind /* "visits" | "hospitalizations" */) =>
    data.filter(
      (d) =>
        d?.metric === `${base} ${kind}` &&
        isOverallLike(d?.submetric)
    );

  const visits = seriesFor("visits");
  const hospitalizations = seriesFor("hospitalizations");

  const getLatestAndChange = (series) => {
    const sorted = [...series].sort(sortByDateAsc);
    const len = sorted.length;
    if (len < 2) return { latest: null, change: null, date: null };

    const latestVal = toNum(sorted[len - 1].value);
    const prevVal = toNum(sorted[len - 2].value);
    if (latestVal == null || prevVal == null) {
      return { latest: null, change: null, date: null };
    }

    // We treat these as percentages already (percentage points change)
    const change = latestVal - prevVal;
    const trendArrow = change >= 0 ? "▲" : "▼";
    const changeAbs = Math.abs(change);

    // Display with 1 decimal place, like "12.3%"
    const latestPct = `${latestVal.toFixed(1)}%`;
    const changePct = `${trendArrow} ${changeAbs.toFixed(1)}%`;
    const asOf = formatAsOf(sorted[len - 1]);

    return {
      latest: latestPct,
      change: changePct,
      date: asOf,
    };
  };

  return {
    ...getLatestAndChange(visits),
    admitData: getLatestAndChange(hospitalizations),
  };
}
