import React from "react";
import PropTypes from "prop-types";

const DownloadModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Download Data</h3>
        <p>This will download the currently visible data as a CSV file.</p>
        <div className="modal-actions">
          <button onClick={onConfirm}>Download</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

DownloadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DownloadModal;
