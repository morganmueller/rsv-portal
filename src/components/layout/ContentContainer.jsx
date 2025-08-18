import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "../popups/InfoModal";
import "./ContentContainer.css";

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

const ContentContainer = ({
  title,
  subtitle,
  subtitleVariables = {},
  titleVariables = {},         // allow variables for title too
  children,
  className = "",
  background = "white",
  animateOnScroll = true,
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
  const renderedTitle = isTitleString ? resolveText(title, titleVariables) : title;
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
    dangerouslySetInnerHTML={{ __html: renderedTitle }}
  />
) : (
  <h3 className="content-title">{renderedTitle}</h3>
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
  onDownloadClick: PropTypes.func,
};

export default ContentContainer;
