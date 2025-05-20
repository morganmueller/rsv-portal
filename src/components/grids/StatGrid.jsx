import React from "react";
import StatCard from "../StatCard";
import "./StatGrid.css";
import text from "../../content/text.json";

const StatGrid = ({ data }) => {
  if (!data) return null;

  const viruses = [
    { key: "ari", label: "ARI" },
    { key: "covid", label: "COVID" },
    { key: "flu", label: "Flu" },
    { key: "rsv", label: "RSV" },
  ];

  const statCards = viruses.map(({ key, label }) => {
    const visitSeries = data[`${label} visits`] || [];
    const admitSeries = data[`${label} admits`] || [];

    const latestVisit = visitSeries.at(-1);
    const prevVisit = visitSeries.at(-2);
    const latestAdmit = admitSeries.at(-1);
    const prevAdmit = admitSeries.at(-2);

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
      admitPercent: formatValue(latestAdmit),
      visitChange: computeChange(latestVisit, prevVisit),
      admitChange: computeChange(latestAdmit, prevAdmit),
      visitDate: formatDate(latestVisit),
      admitDate: formatDate(latestAdmit),
    };
  });

  return (
    <div className="stat-grid">
      <div className="top-row">
        <StatCard key={statCards[0].key} {...statCards[0]} />
        <div className="stat-info-box">
          <h4 className="stat-info-title">{text.overview.summaryBox.title}</h4>
          <p className="stat-info-description">{text.overview.summaryBox.description}</p>
        </div>
      </div>
      <div className="bottom-row">
        {statCards.slice(1).map((card) => (
          <StatCard key={card.key} {...card} />
        ))}
      </div>
    </div>
  );
};

export default StatGrid;
