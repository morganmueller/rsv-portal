import React from "react";
import overviewGridItems from "./OverviewGrid.config";
import { getText } from "../../utils/contentUtils";
import "./OverviewGrid.css";

const OverviewGrid = () => (
  <section className="overview-grid-section">
    <div className="content-header">
      <h2 className="overview-grid-title">{getText("overviewBottomNav.title")}</h2>
    </div>

    <div className="overview-grid">
      {overviewGridItems.map((item, i) => {
        const { labelKey, descriptionKey, link, icon } = item;
        const isExternal = /^https?:\/\//i.test(link);

        const aria =
          (getText(labelKey) || "Open link") +
          (isExternal ? " (opens in a new tab)" : "");

        return (
          <a
            key={i}
            className={`grid-card${isExternal ? " external" : ""}`}
            href={link}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={aria}
          >
            {/* external icon in the top-right if provided in config */}
            <h3 className="grid-card-title">
              {getText(labelKey)}
            {isExternal && icon && (
              <img
                src={icon}
                alt=""
                aria-hidden="true"
                className="external-icon"
                decoding="async"
                loading="lazy"
              />
            )}
          </h3>
            <p>{getText(descriptionKey)}</p>
          </a>
        );
      })}
    </div>
  </section>
);

export default OverviewGrid;
