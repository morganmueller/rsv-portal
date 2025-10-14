import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { loadCSVData } from "../../utils/loadCSVData";
import "./SeasonalBullet.css";

export default function SeasonalBullet({
  config,
  dataSource, // hydrated slice if available (preferred)
  pageState,
  as: As = "p",
  className = "seasonal-bullet",
}) {
  const {
    id,
    dataPath,
    season, // { start: {month, day}, end: {month, day} }
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
  const sourceRows =
    Array.isArray(dataSource) && dataSource.length ? dataSource : fallbackRows || [];

  // ----- visibility gate -----
  const shouldShow = useMemo(() => {
    return typeof showWhen === "function" ? !!showWhen(pageState || {}) : true;
  }, [showWhen, pageState]);

  // ======================= Core computation =======================
  const info = useMemo(() => {
    if (err) return null;
    if (!shouldShow) return null;
    if (!Array.isArray(sourceRows) || sourceRows.length === 0) return null;

    // 1) Filter to this metric
    const metricRows = filters.metric
      ? sourceRows.filter((r) => r.metric === filters.metric)
      : sourceRows;

    if (!metricRows.length) return null;

    // 2) Helpers to detect seasonal vs weekly
    const toStr = (x) => (x == null ? "" : String(x));
    const isSeasonalLabel = (s) => typeof s === "string" && /^seasonal\s+/i.test(s.trim());

    // Seasonal rows for this metric
    const seasonalRows = metricRows.filter((r) => isSeasonalLabel(r.submetric));

    // Prefer explicit seasonalSubmetric match; otherwise most recent by date
    const seasonRow = seasonalSubmetric
      ? seasonalRows.find((r) => r.submetric === seasonalSubmetric)
      : [...seasonalRows].sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]))[0];

    // Weekly rows are anything labeled "Weekly" OR any non-seasonal submetric for backward compat
    const weeklyRows = metricRows.filter((r) => {
      const sub = toStr(r.submetric).trim();
      if (!sub) return false;
      if (/^weekly$/i.test(sub)) return true;
      return !isSeasonalLabel(sub) && !/^seasonal total$/i.test(sub);
    });

    // Latest weekly row with a value/date, if it exists
    const latestWeekly = [...weeklyRows].reverse().find((r) => {
      const v = toStr(r?.[weeklyField]).trim();
      const d = r?.[dateField];
      return v !== "" && d != null && !Number.isNaN(new Date(d).getTime());
    });

    // Require a seasonal row; otherwise we can't render the bullet
    if (!seasonRow) return null;

    // Values as strings (so zero/lt buckets still work consistently)
    const weeklyVal = latestWeekly ? toStr(latestWeekly[weeklyField]).trim() : null;
    const seasonalVal = toStr(seasonRow[weeklyField]).trim();

    // Normalize the "as of" date from weekly or seasonal row (supports Date or string)
    const asOfRaw = latestWeekly?.[dateField] ?? seasonRow?.[dateField] ?? null;
    if (!asOfRaw) return null;

    const asOfDateObj = asOfRaw instanceof Date ? asOfRaw : new Date(asOfRaw);
    if (Number.isNaN(asOfDateObj.getTime())) return null;

    // ISO-like string if needed elsewhere; human chip uses a long format
    const asOfDateISO = asOfDateObj.toISOString().slice(0, 10);

    if (!seasonalVal) return null;

    // Season label directly from submetric (e.g., "Seasonal 2025-2026" -> "2025–2026")
    const rawSeasonLabel = toStr(seasonRow.submetric);
    const seasonLabel = rawSeasonLabel.replace(/^Seasonal\s+/i, "").replace(/-/g, "–");

    // "In-season" check uses the configured month/day window but keyed to the as-of date
    const inSeasonFlag = isInSeason(asOfDateObj, season);
    const asOfDate = formatDisplayDateLong(asOfDateObj);

    // Build message via templates (if provided), else use rich render
    const message = templates
      ? buildSeasonalMessage({
          asOfDate,
          weeklyValue: weeklyVal,
          seasonalTotalValue: seasonalVal,
          seasonLabel,
          diseaseLabel,
          inSeasonFlag,
          templates,
        })
      : null;

    return {
      weeklyVal,
      seasonalVal,
      asOfDate,     // human readable chip
      asOfDateISO,  // normalized if needed later
      seasonLabel,
      inSeasonFlag,
      message,
    };
  }, [
    err,
    shouldShow,
    sourceRows,
    filters.metric,
    weeklyField,
    seasonalSubmetric,
    dateField,
    season,
    diseaseLabel,
    templates,
  ]);

  if (!info) return null;

  const allowRichRender = !templates;

  // ======================= Render helpers =======================
  const bucketType = (val) => {
    if (val === "0") return "zero";
    if (typeof val === "string" && val.startsWith("<")) return "lt";
    return "num";
  };

  const wkBucket = info.weeklyVal == null ? null : bucketType(info.weeklyVal);
  const stBucket = bucketType(info.seasonalVal);

  const WkVal = () =>
    wkBucket == null ? null : (
      <span className={`sb-val is-${wkBucket}`}>{wkBucket === "zero" ? "no" : info.weeklyVal}</span>
    );

  const StVal = () => (
    <span className={`sb-val is-${stBucket}`}>{stBucket === "zero" ? "no" : info.seasonalVal}</span>
  );

  const DateChip = () => <span className="sb-chip sb-chip--date">{info.asOfDate}</span>;
  const SeasonChip = () => <span className="sb-chip sb-chip--season">{info.seasonLabel}</span>;

  // ======================= Render =======================
  return allowRichRender ? (
    <As className={className} data-bullet-id={id}>
      {info.inSeasonFlag ? (
        <>
          {/* If you want the weekly sentence back when weeklyVal exists, uncomment below:
          {wkBucket != null && (
            <>
              There were <WkVal /> {diseaseLabel || "deaths"} reported this week.
              <span className="sb-divider" />
            </>
          )} */}
          As of <DateChip />, <StVal /> {diseaseLabel || "deaths"} have been reported during the{" "}
          <SeasonChip /> season.
        </>
      ) : (
        <>
          A total of <StVal /> {diseaseLabel || "deaths"} were reported to the Health Department
          during the <SeasonChip /> season.
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

function isInSeason(dateish, seasonCfg) {
  const d = dateish instanceof Date ? dateish : new Date(dateish);
  if (!(seasonCfg && seasonCfg.start && seasonCfg.end) || Number.isNaN(d.getTime())) return false;

  const start = new Date(d.getFullYear(), m(seasonCfg.start.month), seasonCfg.start.day || 1);
  const end = new Date(d.getFullYear(), m(seasonCfg.end.month), seasonCfg.end.day || 1);

  return start <= end ? d >= start && d <= end : d >= start || d <= end;
}

function formatDisplayDateLong(dateish) {
  const d = dateish instanceof Date ? dateish : new Date(dateish);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Build a message string using optional templates.
 * Uses parsed seasonLabel (e.g., "2025–2026") and provided asOfDate.
 */
function buildSeasonalMessage({
  asOfDate,
  weeklyValue,
  seasonalTotalValue,
  seasonLabel,
  diseaseLabel,
  inSeasonFlag,
  templates = {},
}) {
  const disease = diseaseLabel || "deaths";

  const T = {
    inSeason: {
      weeklyZero: templates.inSeason?.weeklyZero || `There were no ${disease} reported this week.`,
      weeklyLt:
        templates.inSeason?.weeklyLt ||
        ((n) => `There were fewer than ${n} ${disease} reported this week.`),
      weeklyNum:
        templates.inSeason?.weeklyNum ||
        ((n) => `There were ${n} ${disease} reported this week.`),

      seasonToDateZero:
        templates.inSeason?.seasonToDateZero ||
        `As of ${asOfDate}, no ${disease} have been reported to the Health Department during the ${seasonLabel} season.`,
      seasonToDateLt:
        templates.inSeason?.seasonToDateLt ||
        ((n) =>
          `As of ${asOfDate}, fewer than ${n} ${disease} have been reported to the Health Department during the ${seasonLabel} season.`),
      seasonToDateNum:
        templates.inSeason?.seasonToDateNum ||
        ((n) =>
          `As of ${asOfDate}, ${n} ${disease} have been reported to the Health Department during the ${seasonLabel} season.`),
    },
    outOfSeason: {
      totalZero:
        templates.outOfSeason?.totalZero ||
        `No ${disease} were reported to the Health Department during the ${seasonLabel} season.`,
      totalLt:
        templates.outOfSeason?.totalLt ||
        ((n) =>
          `Fewer than ${n} ${disease} were reported to the Health Department during the ${seasonLabel} season.`),
      totalNum:
        templates.outOfSeason?.totalNum ||
        ((n) =>
          `A total of ${n} ${disease} were reported to the Health Department during the ${seasonLabel} season.`),
    },
  };

  const parseBucket = (val, { zero, lt, num }) => {
    if (val === "0") return zero;
    if (typeof val === "string" && val.startsWith("<")) return lt(val.slice(1));
    return num(val);
    // Note: if val is null/undefined, caller avoids this function entirely.
  };

  if (!inSeasonFlag) {
    return parseBucket(seasonalTotalValue, {
      zero: T.outOfSeason.totalZero,
      lt: T.outOfSeason.totalLt,
      num: T.outOfSeason.totalNum,
    });
  }

  // If in-season and a weekly value exists, include weekly sentence before season-to-date.
  const weeklySentence =
    weeklyValue == null
      ? ""
      : parseBucket(weeklyValue, {
          zero: T.inSeason.weeklyZero,
          lt: T.inSeason.weeklyLt,
          num: T.inSeason.weeklyNum,
        }) + " ";

  const seasonToDateSentence = parseBucket(seasonalTotalValue, {
    zero: T.inSeason.seasonToDateZero,
    lt: T.inSeason.seasonToDateLt,
    num: T.inSeason.seasonToDateNum,
  });

  return `${weeklySentence}${seasonToDateSentence}`.trim();
}
