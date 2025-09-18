import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "../popups/InfoModal";
import DownloadPanel from "../popups/DownloadPanel";
import { colorizeVirusInTitle } from "../../utils/virusText";

import "./ContentContainer.css";

const resolveText = (input, vars = {}) => {
  if (typeof input !== "string") return input;
  return input.replace(/{(\w+)}/g, (_, key) => {
    const raw = vars[key];
    let val =
      raw === null || raw === undefined || raw === "null" || raw === "undefined"
        ? ""
        : String(raw);


  //  if (key === "virus") {
  //   const virusKey = vars.virusKey; // "covid" | "flu" | "rsv" | "ari"
  //   const scale = tokens.colorScales?.[virusKey];
  //   const virusColor = Array.isArray(scale) ? scale[0] : undefined; // pick darkest shade
  //   return `<span class="virus-label" style="color:${virusColor}">${val}</span>`;
  //  }
    

    if (key === "trend") {
      // Clean null/undefined noise
     val = val.replace(/\bnull\b|\bundefined\b/gi, "").replace(/\s+/g, " ").trim();
     // If trend includes any form of zero percent, remove it
     // matches: 0%, +0%, -0%, 0.0%, 0.00%
     const zeroPct = /(^|\s)[+-]?0(?:\.0+)?%/gi;
     const hadOnlyZero =
       val.trim().match(/^[+-]?0(?:\.0+)?%$/i) || val.trim() === "0" || val.trim() === "";
     // Strip any embedded "0%"
     val = val.replace(zeroPct, "").replace(/\s+/g, " ").trim();
     // If it was only zero, standardize to "not changed"
     if (hadOnlyZero || val === "" || /^not\s*changed\s*$/i.test(val)) {
       val = "not changed";
     }
     const direction = vars.trendDirection || "neutral";
     return `<span class="trend-text trend-${direction} bg-highlight">${val}</span>`;
    }

    val = val.replace(/\bnull\b|\bundefined\b/gi, "").replace(/\s+/g, " ").trim();
    return `<span class="dynamic-text">${val}</span>`;
  });
};

const ContentContainer = ({
  title,
  subtitle,
  subtitleVariables = {},
  titleVariables = {},
  children,
  className = "",
  background = "white",
  animateOnScroll = true,
  infoIcon = false,
  downloadIcon = false,
  modalTitle = "More Info",
  modalContent = null,

  // preview props for the download modal
  downloadPreviewData = [],
  downloadColumnLabels = {},
  downloadDescription = "This will download a CSV of this chart’s currently visible data.",

  onDownloadClick = null,
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
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [animateOnScroll]);

  const isTitleString = typeof title === "string";
  const renderedTitleHTML = isTitleString
    ? colorizeVirusInTitle(resolveText(title, titleVariables))
    : null;  
  const isDynamic = typeof title === "string" && /{.+?}/.test(title);

  const isSubtitleString = typeof subtitle === "string";
  const renderedSubtitle = isSubtitleString ? resolveText(subtitle, subtitleVariables) : subtitle;

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
            {isTitleString ? (
              <h3
                className={`content-title ${isDynamic ? "content-title-dynamic" : ""}`}
                dangerouslySetInnerHTML={{ __html: renderedTitleHTML }}
              />
            ) : (
              <h3 className="content-title">{title}</h3>
            )}

          <div className="content-title-icons">
            {infoIcon && (
              <button
                type="button"
                className="icon-button info-icon"
                aria-label="More info about this section"
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                aria-controls="info-modal"
                onClick={() => setIsModalOpen(true)}
              >
                <img src="/assets/info-icon.png" alt="" aria-hidden="true" />
              </button>
            )}

            {downloadIcon && (
              <button
                type="button"
                className="icon-button download-icon"
                aria-label="Download data as CSV"
                aria-haspopup="dialog"
                aria-expanded={isDownloadModalOpen}
                aria-controls="download-modal"
                onClick={() => setIsDownloadModalOpen(true)}
              >
                <img src="/assets/download-data-icon.png" alt="" aria-hidden="true" />
              </button>
            )}
          </div>
          </div>

          {renderedSubtitle &&
            (isSubtitleString ? (
              <div
                className="content-subtitle"
                dangerouslySetInnerHTML={{ __html: renderedSubtitle }}
              />
            ) : (
              <div className="content-subtitle">{renderedSubtitle}</div>
            ))}
        </div>
      )}

      <div className="content-body">{children}</div>

      {/* Info Modal */}
      {infoIcon && modalContent && (
        <InfoModal
          id="info-modal"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          content={modalContent}
        />
      )}

      {/* Download Modal */}
      {downloadIcon && (
        <InfoModal
          id="download-modal"
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          title="Download Data"
          content={
            <DownloadPanel
              onConfirm={() => {
                onDownloadClick?.();
                setIsDownloadModalOpen(false);
              }}
              previewData={downloadPreviewData}
              columnLabels={downloadColumnLabels}
              description={downloadDescription}
            />
          }
        />
      )}
    </div>
  );
};

ContentContainer.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitleVariables: PropTypes.object,
  titleVariables: PropTypes.object,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  background: PropTypes.oneOf(["white", "gray", "transparent"]),
  animateOnScroll: PropTypes.bool,
  infoIcon: PropTypes.bool,
  downloadIcon: PropTypes.bool,
  modalTitle: PropTypes.string,
  modalContent: PropTypes.node,
  downloadPreviewData: PropTypes.array,
  downloadColumnLabels: PropTypes.object,
  downloadDescription: PropTypes.string,
  onDownloadClick: PropTypes.func,
};

export default ContentContainer;
