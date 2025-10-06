import React, { useState, useMemo, useCallback } from "react";
import DataPageLayout from "../../components/layout/DataPageLayout";
import OverviewGrid from "../../components/grids/OverviewGrid";
import ChartContainer from "../../components/layout/ChartContainer";
import ToggleControls from "../../components/controls/ToggleControls";
import ExampleChart from "../../components/charts/ExampleChart";
import ContentContainer from "../../components/layout/ContentContainer";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import overviewConfig from "../config/OverviewPage.config";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";
import { getTrendFromTimeSeries, formatDate } from "../../utils/trendUtils";
import TrendSubtitle from "../controls/TrendSubtitle";
import StatCard from "../../components/cards/StatCard";
import StatCardBottom from "../../components/cards/StatCardBottom";

/* ---------- helpers ---------- */

const KEY_CANDIDATES = (name) => {
  const out = new Set([name]);
  if (/Influenza/i.test(name)) out.add(name.replace(/Influenza/ig, "Flu"));
  if (/Flu/i.test(name)) out.add(name.replace(/Flu/ig, "Influenza"));
  // normalize COVID hyphens
  out.add(name.replace(/COVID[‐-–—−]?19/ig, "COVID-19"));
  return [...out];
};

const sortByWeekOrDateAsc = (a, b) =>
  new Date(a.week || a.date) - new Date(b.week || b.date);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => (s ?? "").toString().trim().toLowerCase();

/** parse numbers from raw values like " 12 %", "4.3%", "1,234", 7 */
const parseNum = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string") {
    const n = Number(raw.replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

/** Pick the field that contains a numeric level on the last row */
const NUMERIC_KEY_CANDIDATES = [
  "value",
  "visits",
  "hospitalizations",
  "percent",
  "percentage",
  "pct",
  "visitPercent",
  "rate",
  "Rate",
];

function detectValueKey(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "value";
  const last = rows.at(-1) || {};
  for (const k of NUMERIC_KEY_CANDIDATES) {
    if (k in last && parseNum(last[k]) !== null) return k;
  }
  // fallback: first key with a number
  const deny = /^(week|date|metric|submetric|display|series|name|label)$/i;
  for (const k of Object.keys(last)) {
    if (deny.test(k)) continue;
    if (parseNum(last[k]) !== null) return k;
  }
  return "value";
}

/** Create a numeric-normalized clone of a series under key __num */
function normalizeSeries(rows, valueKey) {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    ...r,
    __num: parseNum(r?.[valueKey]),
    __date: r?.week || r?.date,
  }));
}

/* ---------- component ---------- */

const OverviewPageLayout = () => {
  const [view, setView] = useState("visits");

  const chartSection = overviewConfig.sections.find((s) => s.id === "combined-virus");
  const chartData = overviewConfig.data?.[chartSection.chart.props.dataSourceKey];

  const dataRoot = overviewConfig.data || {};
  const edData =
    dataRoot.emergencyDeptData ??
    dataRoot.emergency_dept ??
    dataRoot.emergencyDept ??
    dataRoot["emergency-dept"] ??
    dataRoot.ed ??
    dataRoot.emergency ??
    chartData;

  // Flatten nested shapes to an array for fallback filtering
  const allRows = useMemo(() => {
    const out = [];
    const pushArr = (arr) => Array.isArray(arr) && out.push(...arr);
    if (Array.isArray(edData)) pushArr(edData);
    else if (edData && typeof edData === "object") {
      Object.values(edData).forEach((v) => {
        if (Array.isArray(v)) pushArr(v);
        else if (v && typeof v === "object") Object.values(v).forEach(pushArr);
      });
    }
    console.groupCollapsed("[Overview] Data shape");
    console.log("edData type:", Array.isArray(edData) ? "array" : typeof edData);
    console.log("allRows length:", out.length);
    if (!Array.isArray(edData) && edData && typeof edData === "object") {
      console.log("edData keys:", Object.keys(edData));
    }
    console.groupEnd();
    return out;
  }, [edData]);

  // Lookup a series by metric, regardless of the data shape
  const getSeries = useCallback(
    (metricName, submetric = "Overall", display = "Percent") => {
      const candidates = KEY_CANDIDATES(metricName);
      const wantSm = norm(submetric);
      const wantDp = norm(display);

      // keyed-object path
      if (edData && !Array.isArray(edData) && typeof edData === "object") {
        const entries = Object.entries(edData);
        for (const candidate of candidates) {
          const hit = entries.find(([k]) => k.toLowerCase() === candidate.toLowerCase());
          if (hit && Array.isArray(hit[1]) && hit[1].length) {
            const rows = hit[1];

            const primary = rows
              .filter((r) => {
                const sm = norm(r.submetric ?? r.Submetric);
                const dp = norm(r.display ?? r.Display);
                const smOk = sm ? sm === wantSm : true;
                const dpOk = dp ? dp === wantDp || dp.startsWith("percent") : true;
                return smOk && dpOk;
              })
              .sort(sortByWeekOrDateAsc);

            if (primary.length) {
              console.debug(`[getSeries] (keyed) "${candidate}" →`, primary.length, "rows");
              return primary;
            }

            const fallback = rows
              .filter((r) => {
                const sm = norm(r.submetric ?? r.Submetric);
                return sm ? sm === wantSm : true;
              })
              .sort(sortByWeekOrDateAsc);

            if (fallback.length) {
              console.debug(`[getSeries] (keyed-fallback) "${candidate}" →`, fallback.length, "rows");
              return fallback;
            }
          }
        }
      }

      // flat-array path
      if (allRows.length) {
        const names = candidates.map(escapeRe).join("|");
        const metricRe = new RegExp(`^(?:${names})$`, "i");

        const primary = allRows
          .filter((d) => {
            const m = norm(d.metric ?? d.Metric);
            const sm = norm(d.submetric ?? d.Submetric);
            const dp = norm(d.display ?? d.Display);
            const metricOk = metricRe.test(m);
            const smOk = sm ? sm === wantSm : true;
            const dpOk = dp ? dp === wantDp || dp.startsWith("percent") : true;
            return metricOk && smOk && dpOk;
          })
          .sort(sortByWeekOrDateAsc);

        if (primary.length) {
          console.debug(`[getSeries] (flat) "${metricName}" →`, primary.length, "rows");
          return primary;
        }

        const fallback = allRows
          .filter((d) => {
            const m = norm(d.metric ?? d.Metric);
            const sm = norm(d.submetric ?? d.Submetric);
            return metricRe.test(m) && (sm ? sm === wantSm : true);
          })
          .sort(sortByWeekOrDateAsc);

        if (fallback.length) {
          console.debug(`[getSeries] (flat-fallback) "${metricName}" →`, fallback.length, "rows");
          return fallback;
        }
      }

      console.warn(`[getSeries] No rows for "${metricName}"`);
      return [];
    },
    [edData, allRows]
  );

  /* --------- build raw series --------- */

  const rawSeries = useMemo(
    () => ({
      riVisits: getSeries("Respiratory illness visits"),
      riHosp: getSeries("Respiratory illness hospitalizations"),
      covidVisits: getSeries("COVID-19 visits"),
      covidHosp: getSeries("COVID-19 hospitalizations"),
      fluVisits: getSeries("Influenza visits"),
      fluHosp: getSeries("Influenza hospitalizations"),
      rsvVisits: getSeries("RSV visits"),
      rsvHosp: getSeries("RSV hospitalizations"),
    }),
    [getSeries]
  );

  // detect keys + normalize to numeric __num
  const series = useMemo(() => {
    const keys = {
      riVisits: detectValueKey(rawSeries.riVisits),
      riHosp: detectValueKey(rawSeries.riHosp),
      covidVisits: detectValueKey(rawSeries.covidVisits),
      covidHosp: detectValueKey(rawSeries.covidHosp),
      fluVisits: detectValueKey(rawSeries.fluVisits),
      fluHosp: detectValueKey(rawSeries.fluHosp),
      rsvVisits: detectValueKey(rawSeries.rsvVisits),
      rsvHosp: detectValueKey(rawSeries.rsvHosp),
    };

    const normalized = {
      riVisits: normalizeSeries(rawSeries.riVisits, keys.riVisits),
      riHosp: normalizeSeries(rawSeries.riHosp, keys.riHosp),
      covidVisits: normalizeSeries(rawSeries.covidVisits, keys.covidVisits),
      covidHosp: normalizeSeries(rawSeries.covidHosp, keys.covidHosp),
      fluVisits: normalizeSeries(rawSeries.fluVisits, keys.fluVisits),
      fluHosp: normalizeSeries(rawSeries.fluHosp, keys.fluHosp),
      rsvVisits: normalizeSeries(rawSeries.rsvVisits, keys.rsvVisits),
      rsvHosp: normalizeSeries(rawSeries.rsvHosp, keys.rsvHosp),
    };

    // DEV LOGS: peek last two values and computed WoW %
    const peek = (rows) =>
      Array.isArray(rows) && rows.length >= 2
        ? [
            { date: rows.at(-2)?.__date, raw: rows.at(-2), num: rows.at(-2)?.__num },
            { date: rows.at(-1)?.__date, raw: rows.at(-1), num: rows.at(-1)?.__num },
          ]
        : [];

    const wow = (rows) => {
      if (!Array.isArray(rows) || rows.length < 2) return null;
      const curr = rows.at(-1)?.__num;
      const prev = rows.at(-2)?.__num;
      if (!Number.isFinite(curr) || !Number.isFinite(prev)) return null;
      if (prev === 0) return curr === 0 ? 0 : 100; // direction-only case
      return ((curr - prev) / prev) * 100;
    };

    console.groupCollapsed("[Overview] Series debug");
    for (const k of Object.keys(normalized)) {
      const rows = normalized[k];
      const p = peek(rows);
      const w = wow(rows);
      console.groupCollapsed(k, "→", rows.length, "rows | valueKey:", keys[k]);
      console.log("last two:", p);
      console.log("WoW raw %:", w, "| rounded:", Number.isFinite(w) ? Math.round(w) : null);
      console.groupEnd();
    }
    console.groupEnd();

    return { keys, ...normalized };
  }, [rawSeries]);

  /* --------- subtitle uses the SAME series + key as top card --------- */

  const ariRows = view === "visits" ? series.riVisits : series.riHosp;
  const trend = useMemo(
    () =>
      Array.isArray(ariRows) && ariRows.length >= 2
        ? getTrendFromTimeSeries(ariRows, "__num") // use normalized numeric key
        : null,
    [ariRows]
  );

  const last = ariRows?.at?.(-1) || {};
  const latestISO = last.__date || last.week || last.date || null;
  const dateText = latestISO ? formatDate(latestISO) : "N/A";

  const viewLabel = view === "visits" ? "Visits" : "Hospitalizations";
  const viewLabelPreposition = view === "visits" ? "to" : "from";

  const trendText = trend ? (trend.value ? `${trend.label} ${trend.value}` : trend.label) : "not changed";
  const subtitleTemplate = getText(chartSection.subtitle) || "";

  console.groupCollapsed("[Overview] Subtitle trend");
  console.log("view:", view, "| latest:", latestISO);
  console.log("trend:", trend);
  console.groupEnd();

  /* --------- download uses consolidated rows --------- */

  const edRowsForDownload = useMemo(() => {
    if (Array.isArray(edData)) return edData;
    if (edData && typeof edData === "object") return Object.values(edData).flat().filter(Array.isArray).flat();
    return [];
  }, [edData]);

  const handleDownload = () => {
    const filtered = edRowsForDownload.map(({ week, date, [view]: v, value }) => ({
      week: week || date,
      [view]: v ?? value,
    }));
    const prefix = overviewConfig.id || "overview";
    downloadCSV(filtered, `${prefix}-${view}-trend.csv`);
  };

  /* --------- UI --------- */

  return (
    <DataPageLayout
      title={getText(overviewConfig.titleKey)}
      subtitle={getText(overviewConfig.subtitleKey)}
      subtitleVariables={{
        date: dateText,
        trend: trendText,
        trendDirection: trend?.direction || "neutral",
        viewLabel,
        viewLabelPreposition,
      }}
    >
      <ContentContainer
        title={getText("overview.indicators.title")}
        animateOnScroll
        background="white"
      >
        <div className="stat-grid">
          {/* Large ARI cards (same normalized series/key as subtitle) */}
          <StatCard
            title="Overall Respiratory Illness"
            series={series.riVisits}
            valueKey="__num"
            infoText="COVID-19, flu, RSV, and other diagnoses"
          />
          <StatCard
            title="Respiratory illness hospitalizations"
            series={series.riHosp}
            valueKey="__num"
          />

          {/* Compact virus-specific cards */}
          <StatCardBottom title="COVID-19" series={series.covidVisits} valueKey="__num" />
          <StatCardBottom title="COVID-19 hospitalizations" series={series.covidHosp} valueKey="__num" />

          <StatCardBottom title="Flu" series={series.fluVisits} valueKey="__num" />
          <StatCardBottom title="Flu hospitalizations" series={series.fluHosp} valueKey="__num" />

          <StatCardBottom title="RSV" series={series.rsvVisits} valueKey="__num" />
          <StatCardBottom title="RSV hospitalizations" series={series.rsvHosp} valueKey="__num" />
        </div>
      </ContentContainer>

      <ContentContainer
        title={getText(chartSection.title)}
        titleVariables={{ viewLabel, viewLabelPreposition }}
        subtitle={
          <TrendSubtitle
            as="div"
            template={subtitleTemplate}
            variables={{
              date: dateText,
              viewLabel,
              viewLabelPreposition,
              trend: trendText,
              trendDirection: trend?.direction || "neutral",
            }}
          />
        }
        infoIcon={chartSection.infoIcon}
        downloadIcon={chartSection.downloadIcon}
        onDownloadClick={handleDownload}
        modalTitle={chartSection.modal?.title}
        modalContent={
          chartSection.modal?.markdownPath && (
            <MarkdownRenderer
              filePath={chartSection.modal.markdownPath}
              sectionTitle={chartSection.modal.title}
              showTitle={true}
            />
          )
        }
        animateOnScroll={chartSection.animateOnScroll !== false}
      >
        <ChartContainer
          sidebar={<ToggleControls data={allRows} view={view} onToggle={setView} />}
          chart={<ExampleChart data={chartData} view={view} />}
          footer={chartSection.chart.footer}
        />
      </ContentContainer>

      <OverviewGrid />
    </DataPageLayout>
  );
};

export default OverviewPageLayout;
