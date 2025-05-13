import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import "./TrendSummaryContainer.css";

const TrendSummaryContainer = ({
  sectionTitle,
  date,
  trendDirection,
  animateOnScroll = true,
  markdownPath,
  showTitle = false,
  children,
  metricLabel,
  virus = "COVID-19",
  view = "visits",
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const trendText =
    trendDirection === "up" ? "higher than last week" : "lower than last week";
  const arrow = trendDirection === "up" ? "▲" : "▼";
  const trendColor = trendDirection === "up" ? "#DC2626" : "#059669";
  const resolvedMetricLabel = metricLabel || view;

  return (
    <div
      ref={ref}
      className={`trend-summary-container ${
        animateOnScroll ? (isVisible ? "fade-in" : "fade-out") : ""
      }`}
    >
      {date && (
        <p className="trend-date">
          Latest data as of <strong>{date}</strong>
        </p>
      )}

      {trendDirection && (
        <div className="trend-status">
          <span className="trend-arrow" style={{ color: trendColor }}>
            {arrow}
          </span>
          <span className="trend-text">
            {virus} {resolvedMetricLabel} are{" "}
            <strong>{trendText}</strong>
          </span>
        </div>
      )}

      {markdownPath && (
        <MarkdownRenderer
          filePath={markdownPath}
          sectionTitle={sectionTitle}
          showTitle={false}
          className="markdown-body"
        />
      )}

      {children && <div className="trend-body">{children}</div>}
    </div>
  );
};

TrendSummaryContainer.propTypes = {
  sectionTitle: PropTypes.string,
  date: PropTypes.string,
  trendDirection: PropTypes.oneOf(["up", "down"]),
  markdownPath: PropTypes.string,
  showTitle: PropTypes.bool,
  metricLabel: PropTypes.string,
  virus: PropTypes.string,
  view: PropTypes.string,
  children: PropTypes.node,
  animateOnScroll: PropTypes.bool,
};

export default TrendSummaryContainer;
