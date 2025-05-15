import React from "react";
import StatCard from "../StatCard";
import "./StatGrid.css";
import text from "../../content/text.json";

const StatGrid = () => {
  // Eventually these could come from a data fetch, Redux, context, etc.
  const defaultDate = "as of 5/11";

  const statCards = [
    {
      key: "ari",
      title: text.overview.statCards.ari.title,
      visitPercent: "3.8%",
      admitPercent: "2.5%",
      visitChange: "9%",
      admitChange: "6%",
      visitDate: defaultDate,
      admitDate: defaultDate,
    },
    {
      key: "covid",
      title: text.overview.statCards.covid.title,
      visitPercent: "1.2%",
      admitPercent: "0.8%",
      visitChange: "12%",
      admitChange: "12%",
      visitDate: defaultDate,
      admitDate: defaultDate,
    },
    {
      key: "flu",
      title: text.overview.statCards.flu.title,
      visitPercent: "4.3%",
      admitPercent: "3.1%",
      visitChange: "8%",
      admitChange: "7%",
      visitDate: defaultDate,
      admitDate: defaultDate,
    },
    {
      key: "rsv",
      title: text.overview.statCards.rsv.title,
      visitPercent: "2.3%",
      admitPercent: "1.2%",
      visitChange: "5%",
      admitChange: "4%",
      visitDate: defaultDate,
      admitDate: defaultDate,
    },
  ];

  return (
    <div className="stat-grid">
      <div className="top-row">
        <StatCard {...statCards[0]} />
        <div className="stat-info-box">
          <h4 className="stat-info-title">Emergency Department Trends</h4>
          <p className="stat-info-description">
            This summary highlights recent patterns in ED visits and admissions related to
            respiratory viruses across NYC. Use the toggles and filters above to explore further.
          </p>
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
