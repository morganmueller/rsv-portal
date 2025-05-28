import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./Sparkline.css";

const Sparkline = ({
  data,
  width = 100,
  height = 30,
  stroke = "#4B5563",
  strokeWidth = 2,
  fill = "none",
  dotColor = "#111827",
  windowSize = null, // if provided, shows only the last `n` data points
  animate = true,
  className = "sparkline",
  style = {},
}) => {
  const [animatedPoints, setAnimatedPoints] = useState([]);
  const svgRef = useRef();

  if (!data || data.length < 2) return null;

  // Apply windowing
  const trimmed = windowSize ? data.slice(-windowSize) : data;

  const max = Math.max(...trimmed);
  const min = Math.min(...trimmed);

  const getXY = (d, i) => {
    const x = (i / (trimmed.length - 1)) * width;
    const y = height - ((d - min) / (max - min || 1)) * height;
    return { x, y };
  };

  const points = trimmed.map((d, i) => getXY(d, i));
  const pointString = points.map(p => `${p.x},${p.y}`).join(" ");

  // Animate with a slight delay
  useEffect(() => {
    if (animate) {
      setAnimatedPoints([]);
      const timeout = setTimeout(() => setAnimatedPoints(points), 20);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedPoints(points);
    }
  }, [data, windowSize]);

  const minIndex = trimmed.indexOf(min);
  const maxIndex = trimmed.indexOf(max);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline chart"
    >
      {animatedPoints.length > 0 && (
        <>
          <polyline
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            points={animatedPoints.map(p => `${p.x},${p.y}`).join(" ")}
            className={animate ? "sparkline-path animate" : "sparkline-path"}
          />
          {/* Dots */}
          {[minIndex, maxIndex].map((i, idx) => {
            const { x, y } = getXY(trimmed[i], i);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={2.5}
                fill={dotColor}
                className="sparkline-dot"
              />
            );
          })}
        </>
      )}
    </svg>
  );
};

Sparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  fill: PropTypes.string,
  dotColor: PropTypes.string,
  windowSize: PropTypes.number,
  animate: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Sparkline;
