import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "../popups/InfoModal";
import DownloadPreviewTable from "../tables/DownloadPreviewTable";
import { getText } from "../../utils/contentUtils";
import "./ContentContainer.css";

const resolveText = (input, variables = {}) => {
  const raw = typeof input === "string" && input.includes(".") ? getText(input) : input;
  if (typeof raw !== "string") return raw;

  return raw.replace(/{(\w+)}/g, (_, key) => {
    const val = variables[key] ?? `{${key}}`;

    if (key === "trend") {
      const direction = variables.trendDirection || "neutral";
      return `<span class='trend-text trend-${direction}'>${val}</span>`;
    }

    return val;
  });
};

const ContentContainer = ({
  title,
  subtitle,
  subtitleVariables = {},
  children,
  className = "",
  background = "white", 
  animateOnScroll = true,
  infoIcon = false,
  downloadIcon = false,
  modalTitle = "More Info",
  modalContent = null,
  onDownloadClick = null,
  previewData = [],
  columnLabels = {},

}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    const node = ref.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [animateOnScroll]);

  const renderedSubtitle =
    typeof subtitle === "string"
      ? resolveText(subtitle, subtitleVariables)
      : subtitle;

  return (
    <div
      ref={ref}
      className={`content-container background-${background} ${className} ${
        animateOnScroll && isVisible ? "fade-in" : ""
      }`}
    >
      {(title || subtitle) && (
        <div className="content-header">
          <div className="content-title-row">
            {typeof title === "string" ? (
              <h3
                className="content-title"
                dangerouslySetInnerHTML={{ __html: title }}
              />
            ) : (
              <h3 className="content-title">{title}</h3>
            )}
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
          {typeof renderedSubtitle === "string" ? (
            <p
              className="content-subtitle"
              dangerouslySetInnerHTML={{ __html: renderedSubtitle }}
            />
          ) : (
            <p className="content-subtitle">{renderedSubtitle}</p>
          )}
        </div>
      )}

      <div className="content-body">{children}</div>

      {infoIcon && modalContent && (
        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          content={modalContent}
        />
      )}

      {downloadIcon && onDownloadClick && (
        <InfoModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          title="Download Data"
          content={
            <>
              <p>Would you like to download a CSV of this chart’s data?</p>
              {Array.isArray(previewData) && previewData.length > 0 && (
               <DownloadPreviewTable data={previewData} columnLabels={columnLabels} maxRows={100} />
              )}
              <button
                className="toggle-button active"
                onClick={() => {
                  onDownloadClick();
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
  background: PropTypes.oneOf(["white", "gray", "transparent"]),
  animateOnScroll: PropTypes.bool,
  infoIcon: PropTypes.bool,
  downloadIcon: PropTypes.bool,
  modalTitle: PropTypes.string,
  modalContent: PropTypes.node,
  onDownloadClick: PropTypes.func,
  previewData: PropTypes.array,
};

export default ContentContainer;