import React from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer"; 
import "./InfoModal.css";

const InfoModal = ({ title, content, markdownPath, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Close info popup">×</button>
        <h3 className="info-modal-title">{title}</h3>
        <div className="info-modal-content">
          {markdownPath ? (
            <MarkdownRenderer filePath={markdownPath} />
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

InfoModal.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node,         // Optional if using markdownPath
  markdownPath: PropTypes.string,  // Optional if using content
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InfoModal;
