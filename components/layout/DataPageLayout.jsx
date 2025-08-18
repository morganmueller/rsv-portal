import React from "react";
import PropTypes from "prop-types";
import "./DataPageLayout.css";

const resolveText = (input, vars = {}) => {
  if (typeof input !== "string") return input;

  return input.replace(/{(\w+)}/g, (_, key) => {
    const raw = vars[key];

    // normalize missing values to empty string
    let val =
      raw === null || raw === undefined || raw === "null" || raw === "undefined"
        ? ""
        : String(raw);

    // if the value itself accidentally contains " null"/" undefined", remove it
    if (key === "trend") {
      val = val.replace(/\bnull\b|\bundefined\b/gi, "").replace(/\s+/g, " ").trim();
      const direction = vars.trendDirection || "neutral";
      return `<span class="trend-text trend-${direction} bg-highlight">${val}</span>`;
    }

    // generic cleanup for other tokens too
    val = val.replace(/\bnull\b|\bundefined\b/gi, "").replace(/\s+/g, " ").trim();
    return `<span class="dynamic-text">${val}</span>`;
  });
};


const DataPageLayout = ({
  title,
  subtitle,
  topControls,
  info,
  children,
  titleVariables = {},
  subtitleVariables = {},
}) => {
  const renderedTitle =
    typeof title === "string" ? resolveText(title, titleVariables) : title;

  const renderedSubtitle =
    typeof subtitle === "string" ? resolveText(subtitle, subtitleVariables) : subtitle;

  return (
    <main className="data-page">
      <div className="data-section-wrapper">
        <div className="data-section-container">
          {typeof renderedTitle === "string" ? (
            <h2
              className="data-title"
              dangerouslySetInnerHTML={{ __html: renderedTitle }}
            />
          ) : (
            <h2 className="data-title">{renderedTitle}</h2>
          )}

          {renderedSubtitle && (
            <div
              className="data-subtitle"
              dangerouslySetInnerHTML={{
                __html: typeof renderedSubtitle === "string" ? renderedSubtitle : String(renderedSubtitle),
              }}
            />
          )}

          {topControls && (
            <div className="data-controls-wrapper">
              <div className="data-controls-row">{topControls}</div>
            </div>
          )}

          <div className="info-container">{info}</div>
        </div>
      </div>

      <div className="data-highlight">
        <div className="data-container">{children}</div>
      </div>
    </main>
  );
};

DataPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  topControls: PropTypes.node,
  info: PropTypes.node,
  children: PropTypes.node.isRequired,
  // NEW:
  titleVariables: PropTypes.object,
  subtitleVariables: PropTypes.object,
};

export default DataPageLayout;
