import React from "react";
import { getText } from "../../utils/contentUtils";
import InfoCard from "../cards/InfoCard";
import overviewGridItems from "./OverviewGrid.config";
import "./OverviewGrid.css";

const OverviewGrid = () => (
  <section className="overview-grid-section">
    <div className="overview-grid-container">
      <div className="content-header">
        <h2 className="overview-grid-title">{getText("overviewBottomNav.title")}</h2>
      </div>

      <div className="overview-grid">
        {overviewGridItems.map(({ labelKey, descriptionKey, link, icon, showExternalIcon }, i) => {
          const isExternal = link?.startsWith("http");
          const externalIcon =
            isExternal && (showExternalIcon ?? true) ? "/assets/external-link-icon.png" : "";

          return (
            <InfoCard
              key={i}
              title={getText(labelKey)}
              description={descriptionKey ? getText(descriptionKey) : ""} // optional
              link={link}
              icon={icon}
              externalIcon={externalIcon}
            />
          );
        })}
      </div>
    </div>
  </section>
);

export default OverviewGrid;
