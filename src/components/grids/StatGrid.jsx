import React from "react";
import StatCard from "../StatCard";
import StatCardBottom from "../StatCardBottom";
import "./StatGrid.css";
import text from "../../content/text.json";

const DAY_MS = 24 * 60 * 60 * 1000;
const fmt = (d) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StatGrid = ({ data }) => {
  if (!data) return null;

  const viruses = [
    { key: "ari", label: "ARI" },
    { key: "covid", label: "COVID-19" },
    { key: "flu", label: "Influenza" },
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

  // Use ARI visits as the canonical "latest" date (same as before but robust)
  const latestAri = (data["ARI visits"] || []).at?.(-1) || null;
  const baseDate = latestAri ? new Date(latestAri.date) : null;

  const formattedDate = baseDate ? fmt(baseDate) : "–";
  const previousWeek = baseDate ? fmt(new Date(baseDate.getTime() - 7 * DAY_MS)) : "–";

  const titleText = (text.overview.summaryBox.title || "")
    .replace("{date}", formattedDate)
    .replace("{previousWeek}", previousWeek);

  const descriptionHtml = (text.overview.summaryBox.description || "")
    .replaceAll("{date}", formattedDate)
    .replaceAll("{previousWeek}", previousWeek);

  return (
    <div className="stat-grid">
      <h3 className="stat-info-title">{titleText}</h3>

      <div className="stat-info-box">
        <div className="stat-card-container-left">
          <div
            className="stat-info-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
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
