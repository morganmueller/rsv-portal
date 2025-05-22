import React, { useRef, useEffect, useState, forwardRef } from "react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import { getTrendInfo } from "../../utils/getTrendInfo";
import "./TrendSummaryContainer.css";

const TrendSummaryContainer = forwardRef(({
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
}, ref) => {
  const localRef = useRef(null);
  const resolvedRef = ref ?? localRef;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = resolvedRef.current;
    if (!animateOnScroll || !node) return;
  
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
  
    observer.observe(node);
  
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [animateOnScroll]);
  

  const resolvedMetricLabel = metricLabel || view;
  const trend = getTrendInfo({
    trendDirection,
    metricLabel: resolvedMetricLabel,
    virus,
  });

  return (
    <div
      ref={resolvedRef}
      className={`trend-summary-container ${animateOnScroll && isVisible ? "fade-in" : ""}`}
    >
      {date && (
        <p className="trend-date">
          Latest data as of <strong>{date}</strong>
        </p>
      )}

      {trend && (
        <div className="trend-status">
          <span className="trend-arrow" style={{ color: trend.trendColor }}>
            {trend.arrow}
          </span>
          <span className="trend-text" style={{ color: trend.trendColor }}>
            {trend.label}
            <strong>{trend.directionText}</strong>
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
});

TrendSummaryContainer.displayName = "TrendSummaryContainer";

TrendSummaryContainer.propTypes = {
  sectionTitle: PropTypes.string,
  date: PropTypes.string,
  trendDirection: PropTypes.oneOf(["up", "down", "same"]),
  markdownPath: PropTypes.string,
  showTitle: PropTypes.bool,
  metricLabel: PropTypes.string,
  virus: PropTypes.string,
  view: PropTypes.string,
  children: PropTypes.node,
  animateOnScroll: PropTypes.bool,
};

export default TrendSummaryContainer;
