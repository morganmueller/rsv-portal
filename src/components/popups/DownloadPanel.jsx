import React from "react";
import PropTypes from "prop-types";
import DownloadPreviewTable from "../tables/DownloadPreviewTable";
import "../popups/DownloadPanel.css";

const DownloadPanel = ({ onConfirm, previewData = [], columnLabels = {}, description }) => {
  const hasPreview = Array.isArray(previewData) && previewData.length > 0;

  return (
    <div className="download-panel">
      <div className="download-panel-header">
        <button
          type="button"
          className="download-btn"
          onClick={onConfirm}
          aria-label="Download CSV"
          title="Download CSV"
          disabled={!onConfirm}
        >
          Download CSV
        </button>
      </div>

      <p className="download-panel-text">
        {description || "This will download a CSV of this chart’s currently visible data."}
      </p>

      {hasPreview && (
        <DownloadPreviewTable data={previewData} columnLabels={columnLabels} maxRows={100} />
      )}
    </div>
  );
};

DownloadPanel.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  previewData: PropTypes.array,
  columnLabels: PropTypes.object,
  description: PropTypes.string,
};

export default DownloadPanel;
