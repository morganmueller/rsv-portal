import React from "react";
import StatCard from "../StatCard";
import StatCardBottom from "../StatCardBottom";
import "./StatGrid.css";
import text from "../../content/text.json";

const DAY_MS = 24 * 60 * 60 * 1000;
const fmt = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Wraps placeholder values in a bold/highlight span */
const resolveText = (input, vars = {}) => {
  if (typeof input !== "string") return input;
  return input.replace(/{(\w+)}/g, (_, key) => {
    const raw = vars[key];
    const val =
      raw === null || raw === undefined || raw === "null" || raw === "undefined"
        ? ""
        : String(raw);
    const cleaned = val.replace(/\bnull\b|\bundefined\b/gi, "").replace(/\s+/g, " ").trim();
    return `<span class="dynamic-label">${cleaned}</span>`;
  });
};

// Coerce numbers from "12.3%" / " 12 " / 12.3
const toNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

// WoW percent change (relative). If prev == 0, avoid 100% spikes:
//  - If values look fractional (<=1), use delta * 100 (e.g., 0 → 0.10 => +10%)
//  - If values look like whole percents (0 → 10), show +current (=> +10%)
const wowPercentChange = (latest, prev) => {
  const c = toNum(latest?.value);
  const p = toNum(prev?.value);
  if (c == null || p == null) return null;
  if (p === 0) {
    if (c <= 1) return (c - p) * 100; // fractions 0..1
    return c; // whole percents, show +current as the change
  }
  return ((c - p) / p) * 100;
};

const formatValuePct = (d) => (d && toNum(d.value) != null ? `${toNum(d.value).toFixed(1)}%` : "–");
const formatAsOf = (d) => (d?.date ? `as of ${fmt(new Date(d.date))}` : "–");

// Map visible labels to keys in data
const seriesKeysForLabel = (label) => {
  if (label === "Respiratory illness") {
    return ["Respiratory illness visits", "Respiratory illness hospitalizations"];
  }
  if (label === "Flu" || label === "Influenza") {
    return ["Influenza visits", "Influenza hospitalizations"]; // <-- fix: map Flu → Influenza
  }
  return [`${label} visits`, `${label} hospitalizations`];
};

const StatGrid = ({ data }) => {
  if (!data) return null;

  const viruses = [
    { key: "ari", label: "Respiratory illness" },
    { key: "covid", label: "COVID-19" },
    { key: "flu", label: "Flu" },
    { key: "rsv", label: "RSV" },
  ];

  const statCards = viruses.map(({ key, label }) => {
    const [visKey, hosKey] = seriesKeysForLabel(label);
    const visitSeries = data[visKey] || [];
    const hospitalizationSeries = data[hosKey] || [];

    const latestVisit = visitSeries.at?.(-1) ?? null;
    const prevVisit = visitSeries.at?.(-2) ?? null;
    const latestAdmit = hospitalizationSeries.at?.(-1) ?? null;
    const prevAdmit = hospitalizationSeries.at?.(-2) ?? null;

    // === DEBUG LOGS ===
    console.groupCollapsed(`[StatGrid] ${label}`);
    console.log("Using keys:", { visitsKey: visKey, hospKey: hosKey });
    console.log("Visits length:", visitSeries.length, "Hosp length:", hospitalizationSeries.length);
    console.log("Visits last two:", {
      prev: prevVisit ? { date: prevVisit.date, value: prevVisit.value } : null,
      curr: latestVisit ? { date: latestVisit.date, value: latestVisit.value } : null,
    });
    console.log("Hosp last two:", {
      prev: prevAdmit ? { date: prevAdmit.date, value: prevAdmit.value } : null,
      curr: latestAdmit ? { date: latestAdmit.date, value: latestAdmit.value } : null,
    });
    console.log("WoW visits % change:", wowPercentChange(latestVisit, prevVisit));
    console.log("WoW hosp % change:  ", wowPercentChange(latestAdmit, prevAdmit));
    console.groupEnd();
    // ===================

    const statText = text?.overview?.statCards?.[key] || {};
    const title = statText.title || label;
    const infoText = statText.infoText || "";

    return {
      key,
      title,
      infoText,
      visitPercent: formatValuePct(latestVisit),
      hospitalizationPercent: formatValuePct(latestAdmit),
      visitChange: wowPercentChange(latestVisit, prevVisit),
      admitChange: wowPercentChange(latestAdmit, prevAdmit),
      visitDate: formatAsOf(latestVisit),
      admitDate: formatAsOf(latestAdmit),
    };
  });

  // Use ARI visits as the canonical "latest" date
  const latestAri = (data["Respiratory illness visits"] || []).at?.(-1) || null;
  const baseDate = latestAri ? new Date(latestAri.date) : null;

  const formattedDate = baseDate ? fmt(baseDate) : "–";
  const previousWeek = baseDate ? fmt(new Date(baseDate.getTime() - 7 * DAY_MS)) : "–";

  const vars = { date: formattedDate, previousWeek };

  const rawTitle = text?.overview?.summaryBox?.title || "";
  const titleHTML = resolveText(rawTitle, vars);

  const rawDesc = text?.overview?.summaryBox?.description || "";
  const descriptionHTML = resolveText(rawDesc, vars);

  // Fix React key warning: pull key off and pass separately
  const { key: topKey, ...topProps } = statCards[0];

  return (
    <div className="stat-grid">
      <h3
        className="stat-info-title"
        dangerouslySetInnerHTML={{ __html: titleHTML }}
      />

      <div className="stat-info-box">
        <div className="stat-card-container-left">
          <div
            className="stat-info-description"
            dangerouslySetInnerHTML={{ __html: descriptionHTML }}
          />
        </div>

        <div className="stat-card-container-right">
          <div className="top-row">
            <StatCard key={topKey} {...topProps} />
          </div>

          <div className="bottom-row">
            {statCards.slice(1).map(({ key, ...cardProps }) => (
              <StatCardBottom key={key} {...cardProps} />
            ))}
          </div>
        </div>
      </div>

      <div className="week-of">Compared to week of {previousWeek}</div>
    </div>
  );
};

export default StatGrid;
