// src/components/layout/ContentContainer.jsx
import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import InfoModal from "../popups/InfoModal";
import DownloadPanel from "../popups/DownloadPanel";
import { colorizeVirusInTitle } from "../../utils/virusText";
import "./ContentContainer.css";

const resolveText = (input, vars = {}) => {
  if (typeof input !== "string") return input;

  return input.replace(/{(\w+)}/g, (_, key) => {
    let raw = vars[key];
    if (raw === null || raw === undefined || raw === "null" || raw === "undefined") {
      return "";
    }
    let val = String(raw).trim();

    // Force percent suffix for trend-like values
    if (key.toLowerCase().includes("trend") || key.toLowerCase().includes("percent")) {
      const isNumericNoPercent = /^[-+]?\d+(?:\.\d+)?$/.test(val);
      if (isNumericNoPercent) val = `${val}%`;
    }

    // Optional early wrap if the token name is date-ish
    if (key.toLowerCase() === "date" || key.toLowerCase() === "weekendingdate") {
      // If caller already provided markup, don't double wrap
      if (!/[<>]/.test(val)) {
        val = `<span class="bg-highlight dynamic-text">${val}</span>`;
      }
    }
    return val;
  });
};

const MONTHS =
  "(January|February|March|April|May|June|July|August|September|October|November|December)";
const DATE_RE = new RegExp(`\\b${MONTHS}\\s+\\d{1,2},\\s+\\d{4}\\b`);

function wrapFreeformDates(rootEl) {
  if (!rootEl) return;

  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // ignore whitespace-only
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      // if parent already has our classes, skip
      const parent = node.parentElement;
      if (parent && (parent.classList.contains("bg-highlight") || parent.classList.contains("dynamic-text"))) {
        return NodeFilter.FILTER_REJECT;
      }
      return DATE_RE.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });

  const toProcess = [];
  while (walker.nextNode()) toProcess.push(walker.currentNode);

  toProcess.forEach((textNode) => {
    const text = textNode.nodeValue;
    // Replace the first date instance per text node to avoid over-wrapping
    const replaced = text.replace(DATE_RE, (m) => `[[DATE_WRAP_START]]${m}[[DATE_WRAP_END]]`);
    if (replaced === text) return;

    // Build a fragment with wrapped span
    const frag = document.createElement("span");
    frag.innerHTML = replaced
      .replace("[[DATE_WRAP_START]]", `<span class="bg-highlight dynamic-text">`)
      .replace("[[DATE_WRAP_END]]", `</span>`);

    // Replace the text node with the fragment’s children
    const parent = textNode.parentNode;
    while (frag.firstChild) parent.insertBefore(frag.firstChild, textNode);
    parent.removeChild(textNode);
  });
}
/** --------------------------------------------------------------- */

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
  const subtitleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Inline style ensures the icon always respects the CSS var, even if a selector misses.
  const iconFilterStyle = { filter: "var(--img-filter)", WebkitFilter: "var(--img-filter)" };

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
  const renderedSubtitle = isSubtitleString
    ? resolveText(subtitle, subtitleVariables)
    : subtitle;

  useEffect(() => {
    const t = setTimeout(() => wrapFreeformDates(subtitleRef.current), 0);
    return () => clearTimeout(t);
  }, [renderedSubtitle]);

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
                  {/* add class + inline var-driven filter to guarantee it applies */}
                  <img
                    className="info-icon-img"
                    src="/assets/info-icon.png"
                    alt=""
                    aria-hidden="true"
                    style={iconFilterStyle}
                  />
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
                  <img
                    className="download-icon-img"
                    src="/assets/download-data-icon.png"
                    alt=""
                    aria-hidden="true"
                    style={iconFilterStyle}
                  />
                </button>
              )}
            </div>
          </div>

          {renderedSubtitle &&
            (isSubtitleString ? (
              <div
                ref={subtitleRef}
                className="content-subtitle"
                dangerouslySetInnerHTML={{ __html: renderedSubtitle }}
              />
            ) : (
              <div ref={subtitleRef} className="content-subtitle">
                {renderedSubtitle}
              </div>
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
