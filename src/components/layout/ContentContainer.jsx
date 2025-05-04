import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "../popups/InfoModal";
import "./ContentContainer.css";

const ContentContainer = ({
  title,
  subtitle,
  subtitleVariables = {},
  children,
  className = "",
  animateOnScroll = false,
  infoIcon = false,
  downloadIcon = false,
  modalTitle = "More Info",
  modalContent = null,
  onDownloadClick = null,
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const node = ref.current;
    if (node) observer.observe(node);
    return () => node && observer.unobserve(node);
  }, [animateOnScroll]);

  const renderedSubtitle =
    typeof subtitle === "string"
      ? subtitle.replace(/{(\w+)}/g, (_, key) => subtitleVariables[key] || "")
      : subtitle;

  return (
    <div
      ref={ref}
      className={`content-container ${className} ${
        animateOnScroll ? (isVisible ? "fade-in" : "fade-out") : ""
      }`}
    >
      {(title || subtitle) && (
        <div className="content-header">
          <div className="content-title-row">
            <h3 className="content-title">{title}</h3>
            <div className="content-title-icons">
              {infoIcon && (
                <img
                  src="/assets/info-icon.png"
                  alt="More info"
                  className="icon info-icon"
                  onClick={() => setIsModalOpen(true)}
                />
              )}
              {downloadIcon && (
                <img
                  src="/assets/download-data-icon.png"
                  alt="Download CSV"
                  className="icon download-icon"
                  onClick={() => setIsDownloadModalOpen(true)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>
          </div>
          {renderedSubtitle && <p className="content-subtitle">{renderedSubtitle}</p>}
        </div>
      )}

      <div className="content-body">{children}</div>

      {/* Info Modal */}
      {infoIcon && modalContent && (
        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          content={modalContent}
        />
      )}

      {/* Download Modal */}
      {downloadIcon && onDownloadClick && (
        <InfoModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          title="Download Data"
          content={
            <>
              <p>Would you like to download a CSV of this chart’s data?</p>
              <button
                className="toggle-button active"
                onClick={() => {
                  onDownloadClick(); // ✅ trigger passed-in download handler
                  setIsDownloadModalOpen(false);
                }}
                style={{ marginTop: "12px" }}
              >
                Yes, Download
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

ContentContainer.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.node,
  subtitleVariables: PropTypes.object,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  animateOnScroll: PropTypes.bool,
  infoIcon: PropTypes.bool,
  downloadIcon: PropTypes.bool,
  modalTitle: PropTypes.string,
  modalContent: PropTypes.node,
  onDownloadClick: PropTypes.func,
};

export default ContentContainer;
