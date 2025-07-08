import React from "react";
import StatCard from "../StatCard";
import StatCardBottom from "../StatCardBottom";
import "./StatGrid.css";
import text from "../../content/text.json";

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

    const latestVisit = visitSeries.at(-1);
    const prevVisit = visitSeries.at(-2);
    const latestAdmit = hospitalizationSeries.at(-1);
    const prevAdmit = hospitalizationSeries.at(-2);

    const computeChange = (latest, prev) => {
      if (!latest || !prev) return null;
      return (latest.value - prev.value).toFixed(1);
    };

    const formatValue = (d) => (d ? `${d.value.toFixed(1)}%` : "–");
    const formatDate = (d) =>
      d
        ? `as of ${new Date(d.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          })}`
        : "–";

    const statText = text?.overview?.statCards?.[key];

    return {
      key,
      title: statText?.title || label,
      visitPercent: formatValue(latestVisit),
      hospitalizationPercent: formatValue(latestAdmit),
      visitChange: computeChange(latestVisit, prevVisit),
      admitChange: computeChange(latestAdmit, prevAdmit),
      visitDate: formatDate(latestVisit),
      admitDate: formatDate(latestAdmit),
    };
  });

  return (
    <div className="stat-grid">
      <h4 className="stat-info-title">{text.overview.summaryBox.title}</h4>
      <div className="stat-info-box">
        <div className="stat-card-container-left">
        <p className="stat-info-description">
          {text.overview.summaryBox.description}
        </p>
        </div>
        <div className="stat-card-container-right">
          <div className="top-row">
            <StatCard key={statCards[0].key} {...statCards[0]} />
          </div>
          <div className="bottom-row">
            {statCards.slice(1).map((card) => (
              <StatCardBottom key={card.key} {...card} />
            ))}
          </div>
        </div>
      </div>
        <div className="week-of">
          For week of: {statCards[0].visitDate.split(" ")[2]}
        </div>
    </div>
  );
};

export default StatGrid;
