import React from "react";
import overviewGridItems from "./OverviewGrid.config";
import { getText } from "../../utils/contentUtils"; // your i18n lookup helper
import "./OverviewGrid.css";

const OverviewGrid = () => (
  <section className="overview-grid">
    {overviewGridItems.map(({ labelKey, descriptionKey, link }, i) => {
      const isExternal = link.startsWith("http");
      return (
        <a
          key={i}
          className="grid-card"
          href={link}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : undefined}
          aria-label={getText(labelKey)}
        >
          <h3>{getText(labelKey)}</h3>
          <p>{getText(descriptionKey)}</p>
        </a>
      );
    })}
  </section>
);

export default OverviewGrid;
