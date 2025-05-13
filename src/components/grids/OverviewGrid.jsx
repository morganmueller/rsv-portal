import React from "react";
import "./OverviewGrid.css";

const OverviewGrid = () => {
  const cards = [
    {
      title: "ED Visits & Admissions",
      description: "Explore emergency department trends across boroughs.",
      link: "/data-explorer/emergency-dept", // internal route
    },
    {
      title: "Explore our Github Repository",
      description: "Visit our Github repo to get code, file an issue, or download data",
      link: "https://github.com/nychealth/respiratory-data-portal", // external link
    },
    {
      title: "COVID-19 Wastewater Surveillance",
      description: "View NYC COVID-19 wastewater surveillance through the New York State dashboard",
      link: "/about#prevention", // anchor or route
    },
  ];

  return (
    <section className="overview-grid">
      {cards.map((card, i) => (
        <a
          key={i}
          className="grid-card"
          href={card.link}
          target={card.link.startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer"
        >
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </a>
      ))}
    </section>
  );
};

export default OverviewGrid;
