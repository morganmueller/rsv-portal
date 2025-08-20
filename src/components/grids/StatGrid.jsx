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

    const latestVisit = visitSeries.at?.(-1);
    const prevVisit = visitSeries.at?.(-2);
    const latestAdmit = hospitalizationSeries.at?.(-1);
    const prevAdmit = hospitalizationSeries.at?.(-2);

    const computeChange = (latest, prev) =>
      (!latest || !prev) ? null : (latest.value - prev.value).toFixed(1);

    const formatValue = (d) => (d ? `${d.value.toFixed(1)}%` : "–");
    const formatDate = (d) =>
      d
        ? `as of ${new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}`
        : "–";

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
      visitDate: formatDate(latestVisit),
      admitDate: formatDate(latestAdmit),
    };
  });

  const visitDateText = statCards[0]?.visitDate || "–";
  const formattedDate = visitDateText
    .split(" ")
    .slice(2)
    .join(" ")
    .replace(/^([A-Za-z]{3}) 0?(\d), (\d{4})$/, "$1 $2, $3");

  return (
    <div className="stat-grid">
      <h3 className="stat-info-title">
        {text.overview.summaryBox.title.replace("{date}", formattedDate)}
      </h3>
      <div className="stat-info-box">
        <div className="stat-card-container-left">
          <div
            className="stat-info-description"
            dangerouslySetInnerHTML={{ __html: text.overview.summaryBox.description }}
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
      <div className="week-of">For week ending: {formattedDate}</div>
    </div>
  );
};

export default StatGrid;
