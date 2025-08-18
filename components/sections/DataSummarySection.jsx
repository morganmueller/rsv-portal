import React from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";

const virusColors = {
  "COVID-19": "#1E40AF",
  "Influenza": "#7C3AED",
  "RSV": "#047857",
  "ARI": "#EAA360",
};

const DataSummarySection = ({ virus, view, trendDirection, lastDate, markdownPath, sectionTitle, showTitle = false }) => {
  const color = virusColors[virus] || "#1F2937";

  return (
    <>
      <p style={{ marginBottom: 16, color: "#000000" }}>
        <strong style={{ color }}>{virus}</strong> {view === "visits" ? "visits" : "hospitalizations"} are trending {trendDirection} since last week ({lastDate}).
      </p>

      <MarkdownRenderer
        filePath={markdownPath}
        sectionTitle={sectionTitle}
      />
    </>
  );
};

DataSummarySection.propTypes = {
  virus: PropTypes.string.isRequired,
  view: PropTypes.oneOf(["visits", "hospitalizations"]).isRequired,
  trendDirection: PropTypes.string.isRequired,
  lastDate: PropTypes.string.isRequired,
  markdownPath: PropTypes.string.isRequired,
  sectionTitle: PropTypes.string.isRequired,
  showTitle: PropTypes.bool,

};

export default DataSummarySection;
