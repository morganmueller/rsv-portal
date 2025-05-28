import React from "react";
import PropTypes from "prop-types";

/**
 * Renders a tiny inline sparkline using SVG.
 * @param {number[]} data - Array of values (e.g., weekly values)
 */
const StatSparkline = ({ data, width = 100, height = 30, stroke = "#4B5563", strokeWidth = 2 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="stat-sparkline" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        points={points.join(" ")}
      />
    </svg>
  );
};

StatSparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
};

export default StatSparkline;
