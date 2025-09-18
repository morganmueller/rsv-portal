// src/components/bullets/SeasonalBullet.jsx
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { loadCSVData } from "../../utils/loadCSVData";
import "./SeasonalBullet.css";

/**
 * SeasonalBullet
 * - Prefers a provided `dataSource` slice.
 * - If absent/empty, self-loads from `config.dataPath`.
 * - Builds the final seasonal sentence locally and renders it.
 */
export default function SeasonalBullet({
  config,
  dataSource, // hydrated slice if available
  pageState,
  as: As = "p",
  className = "seasonal-bullet",
}) {
  const {
    id,
    dataPath,
    season,
    diseaseLabel,
    filters = {},
    weeklyField = "value",
    seasonalSubmetric = "Seasonal total",
    dateField = "date",
    showWhen,
    templates,
  } = config || {};

  // ----- self-load fallback (mirror DynamicParagraph) -----
  const [fallbackRows, setFallbackRows] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    const noSliceProvided = !Array.isArray(dataSource) || dataSource.length === 0;

    if (noSliceProvided && dataPath) {
      loadCSVData(dataPath)
        .then((rows) => {
          if (alive) setFallbackRows(rows);
        })
        .catch((e) => {
          if (alive) setErr(e?.message || "Failed to load CSV");
        });
    }
    return () => {
      alive = false;
    };
  }, [dataSource, dataPath]);

  // choose rows: prefer passed slice, else fallback
  const sourceRows = Array.isArray(dataSource) && dataSource.length
    ? dataSource
    : (fallbackRows || []);

  // ----- visibility gate -----
  const shouldShow = useMemo(() => {
    return typeof showWhen === "function" ? !!showWhen(pageState || {}) : true;
  }, [showWhen, pageState]);

  // ----- compute message + key values (weekly/seasonal/date) -----
  const info = useMemo(() => {
    if (err) return null;
    if (!shouldShow || !season) return null;
    if (!Array.isArray(sourceRows) || sourceRows.length === 0) return null;

    // 1) Filter by metric (only), not submetric yet
    const metricRows = filters.metric
      ? sourceRows.filter((r) => r.metric === filters.metric)
      : sourceRows;

    if (!metricRows.length) return null;

    // 2) From metricRows, split weekly vs seasonal total
    const weeklyRows = metricRows.filter(
      (r) => r.submetric === (filters.submetric || "Weekly")
    );

    // Some rows have empty values; take the last weekly row with a non-empty weeklyField & date
    const latest = [...weeklyRows].reverse().find((r) => {
      const v = String(r?.[weeklyField] ?? "").trim();
      const d = String(r?.[dateField] ?? "").trim();
      return v !== "" && d !== "";
    });

    const seasonTotalRow = metricRows.find(
      (r) => r.submetric === seasonalSubmetric
    );

    if (!latest || !seasonTotalRow) return null;

    const weeklyVal = String(latest[weeklyField]).trim();
    const seasonalVal = String(seasonTotalRow[weeklyField]).trim();
    const dateStr = String(latest[dateField]).trim();

    if (!weeklyVal || !seasonalVal || !dateStr) return null;

    const message = buildSeasonalMessage({
      dateStr,
      weeklyValue: weeklyVal,
      seasonalTotalValue: seasonalVal,
      cfg: { diseaseLabel, season, templates },
    });

    const inSeasonFlag = isInSeason(dateStr, season);
    const asOfDate = formatDisplayDateLong(dateStr);
    const seasonRange = getSeasonYearRange(dateStr, season);

    return { message, weeklyVal, seasonalVal, dateStr, inSeasonFlag, asOfDate, seasonRange };
  }, [
    err,
    shouldShow,
    sourceRows,
    filters.metric,
    filters.submetric,
    weeklyField,
    seasonalSubmetric,
    dateField,
    diseaseLabel,
    season,
    templates,
  ]);

  if (!info) return null;

  // If custom templates are provided, keep the exact string.
  const allowRichRender = !templates;

  // Styling helpers for rich render
  const bucketType = (val) => {
    if (val === "0") return "zero";
    if (typeof val === "string" && val.startsWith("<")) return "lt";
    return "num";
  };

  const wkBucket = bucketType(info.weeklyVal);
  const stBucket = bucketType(info.seasonalVal);

  const WkVal = () => (
    <span className={`sb-val is-${wkBucket}`}>
      {wkBucket === "zero" ? "no" : info.weeklyVal}
    </span>
  );

  const StVal = () => (
    <span className={`sb-val is-${stBucket}`}>
      {stBucket === "zero" ? "no" : info.seasonalVal}
    </span>
  );

  const DateChip = () => <span className="sb-chip sb-chip--date">{info.asOfDate}</span>;
  const SeasonChip = () => <span className="sb-chip sb-chip--season">{info.seasonRange}</span>;

  return allowRichRender ? (
    <As className={className} data-bullet-id={id}>
      {info.inSeasonFlag ? (
        <>
          {/* There were <WkVal /> {diseaseLabel || "deaths"} reported this week. */}
          <span className="sb-divider" />
          As of <DateChip />, <StVal /> {diseaseLabel || "deaths"} have been reported during the <SeasonChip /> season.
        </>
      ) : (
        <>
          A total of <StVal /> {diseaseLabel || "deaths"} were reported to the Health Department during the <SeasonChip /> season.
        </>
      )}
    </As>
  ) : (
    <As className={className} data-bullet-id={id}>
      {info.message}
    </As>
  );
}

SeasonalBullet.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string,
    dataPath: PropTypes.string,
    diseaseLabel: PropTypes.string,
    season: PropTypes.shape({
      start: PropTypes.shape({ month: PropTypes.number, day: PropTypes.number }),
      end: PropTypes.shape({ month: PropTypes.number, day: PropTypes.number }),
    }),
    filters: PropTypes.shape({
      metric: PropTypes.string,
      submetric: PropTypes.string,
    }),
    weeklyField: PropTypes.string,
    seasonalSubmetric: PropTypes.string,
    dateField: PropTypes.string,
    showWhen: PropTypes.func,
    templates: PropTypes.object,
  }).isRequired,
  dataSource: PropTypes.array,
  pageState: PropTypes.shape({
    virus: PropTypes.string,
    dataType: PropTypes.string,
  }),
  as: PropTypes.oneOf(["p", "span", "li"]),
  className: PropTypes.string,
};

/* ======================= Local helpers ======================= */
const m = (mm) => Math.max(0, Math.min(11, (mm ?? 1) - 1));

function isInSeason(dateStr, seasonCfg) {
  const d = new Date(dateStr);
  if (!(seasonCfg && seasonCfg.start && seasonCfg.end) || Number.isNaN(d.getTime())) return false;

  const start = new Date(d.getFullYear(), m(seasonCfg.start.month), seasonCfg.start.day || 1);
  const end = new Date(d.getFullYear(), m(seasonCfg.end.month), seasonCfg.end.day || 1);

  return start <= end ? d >= start && d <= end : d >= start || d <= end;
}

function formatDisplayDateLong(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getSeasonYearRange(dateStr, seasonCfg) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const startMonth = m(seasonCfg.start.month);
  const endMonth = m(seasonCfg.end.month);
  return startMonth > endMonth ? `${y}–${y + 1}` : `${y}–${y}`;
}

function buildSeasonalMessage({ dateStr, weeklyValue, seasonalTotalValue, cfg }) {
  const disease = cfg.diseaseLabel || "deaths";
  const inSeason = isInSeason(dateStr, cfg.season);
  const asOfDate = formatDisplayDateLong(dateStr);
  const seasonRg = getSeasonYearRange(dateStr, cfg.season);
  const t = cfg.templates || {};

  const T = {
    inSeason: {
      weeklyZero: t.inSeason?.weeklyZero || `There were no ${disease} reported this week.`,
      weeklyLt: t.inSeason?.weeklyLt || ((n) => `There were fewer than ${n} ${disease} reported this week.`),
      weeklyNum: t.inSeason?.weeklyNum || ((n) => `There were ${n} ${disease} reported this week.`),

      seasonToDateZero:
        t.inSeason?.seasonToDateZero ||
        `As of ${asOfDate}, no ${disease} have been reported to the Health Department during the ${seasonRg} season.`,
      seasonToDateLt:
        t.inSeason?.seasonToDateLt ||
        ((n) =>
          `As of ${asOfDate}, fewer than ${n} ${disease} have been reported to the Health Department during the ${seasonRg} season.`),
      seasonToDateNum:
        t.inSeason?.seasonToDateNum ||
        ((n) => `As of ${asOfDate}, ${n} ${disease} have been reported to the Health Department during the ${seasonRg} season.`),
    },
    outOfSeason: {
      totalZero:
        t.outOfSeason?.totalZero ||
        `No ${disease} were reported to the Health Department during the ${seasonRg} season.`,
      totalLt:
        t.outOfSeason?.totalLt ||
        ((n) => `Fewer than ${n} ${disease} were reported to the Health Department during the ${seasonRg} season.`),
      totalNum:
        t.outOfSeason?.totalNum ||
        ((n) => `A total of ${n} ${disease} were reported to the Health Department during the ${seasonRg} season.`),
    },
  };

  const parseBucket = (val, { zero, lt, num }) => {
    if (val === "0") return zero;
    if (typeof val === "string" && val.startsWith("<")) return lt(val.slice(1));
    return num(val);
  };

  if (!inSeason) {
    return parseBucket(seasonalTotalValue, {
      zero: T.outOfSeason.totalZero,
      lt: T.outOfSeason.totalLt,
      num: T.outOfSeason.totalNum,
    });
  }

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
