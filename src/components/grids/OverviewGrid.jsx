import React from "react";
import overviewGridItems from "./OverviewGrid.config";
import { getText } from "../../utils/contentUtils";
import "./OverviewGrid.css";

const OverviewGrid = () => (
  <section className="overview-grid-section">
    <div className="overview-grid-container">
      <div className="content-header">
        <h2 className="overview-grid-title">{getText("overviewBottomNav.title")}</h2>
      </div>

      <div className="overview-grid">
        {overviewGridItems.map(({ labelKey, descriptionKey, link, showExternalIcon }, i) => {
          const isExternal = link.startsWith("http");
          const showIcon = isExternal && (showExternalIcon ?? true);

          return (
            <a
              key={i}
              className="grid-card"
              href={link}
              target={isExternal ? "_blank" : "_self"}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={getText(labelKey)}
            >
              <h3 className="grid-card-title">
                {getText(labelKey)}
                {showIcon && (
                  <img
                    src="/assets/external-link-icon.png"
                    alt=""
                    className="external-icon"
                    aria-hidden="true"
                  />
                )}
              </h3>
              <p>{getText(descriptionKey)}</p>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);

export default OverviewGrid;
