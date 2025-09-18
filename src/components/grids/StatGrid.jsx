import React from "react";
import StatCard from "../StatCard";
import StatCardBottom from "../StatCardBottom";
import "./StatGrid.css";
import text from "../../content/text.json";

// If you also want virus-word colorization here later, you can import it:
// import { colorizeVirusInTitle } from "../../utils/virusText";

const DAY_MS = 24 * 60 * 60 * 1000;
const fmt = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Wraps placeholder values in a bold/highlight span, just like other dynamic text */
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

const StatGrid = ({ data }) => {
  if (!data) return null;

  const viruses = [
    { key: "ari", label: "ARI" },
    { key: "covid", label: "COVID-19" },
    { key: "flu", label: "Flu" },
    { key: "rsv", label: "RSV" },
  ];

  const statCards = viruses.map(({ key, label }) => {
    const visitSeries = data[`${label} visits`] || [];
    const hospitalizationSeries = data[`${label} hospitalizations`] || [];

    const latestVisit = visitSeries.at?.(-1);
    const prevVisit = visitSeries.at?.(-2);
    const latestAdmit = hospitalizationSeries.at?.(-1);
    const prevAdmit = hospitalizationSeries.at?.(-2);

    const computeChange = (latest, prev) =>
      !latest || !prev ? null : (latest.value - prev.value).toFixed(1);

    const formatValue = (d) => (d ? `${d.value.toFixed(1)}%` : "–");
    const formatAsOf = (d) =>
      d ? `as of ${fmt(new Date(d.date))}` : "–";

    const statText = text?.overview?.statCards?.[key] || {};
    const title = statText.title || label;
    const infoText = statText.infoText || "";

    return {
      key,
      title,
      infoText,
      visitPercent: formatValue(latestVisit),
      hospitalizationPercent: formatValue(latestAdmit),
      visitChange: computeChange(latestVisit, prevVisit),
      admitChange: computeChange(latestAdmit, prevAdmit),
      visitDate: formatAsOf(latestVisit),
      admitDate: formatAsOf(latestAdmit),
    };
  });

  // Use ARI visits as the canonical "latest" date
  const latestAri = (data["ARI visits"] || []).at?.(-1) || null;
  const baseDate = latestAri ? new Date(latestAri.date) : null;

  const formattedDate = baseDate ? fmt(baseDate) : "–";
  const previousWeek = baseDate ? fmt(new Date(baseDate.getTime() - 7 * DAY_MS)) : "–";

  const vars = { date: formattedDate, previousWeek };

  const rawTitle = text?.overview?.summaryBox?.title || "";
  const titleHTML = resolveText(rawTitle, vars);

  const rawDesc = text?.overview?.summaryBox?.description || "";
  const descriptionHTML = resolveText(rawDesc, vars);

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
            <StatCard {...statCards[0]} />
          </div>

          <div className="bottom-row">
            {statCards.slice(1).map((card) => (
              <StatCardBottom key={card.key} {...card} />
            ))}
          </div>
        </div>
      </div>

      <div className="week-of">Compared to week of {previousWeek}</div>
    </div>
  );
};

export default StatGrid;
