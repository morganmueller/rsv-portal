import React, { useMemo } from "react";
import PropTypes from "prop-types";
import "./ToggleControls.css";

const ToggleControls = ({ data, view, onToggle }) => {
  const handleToggle = (type) => {
    if (onToggle && type !== view) onToggle(type);
  };

  const peak = useMemo(() => {
    if (!data || data.length === 0 || !view) return null;
    const max = data.reduce((a, b) => (a[view] > b[view] ? a : b));
    return {
      value: max[view].toLocaleString(),
      date: new Date(max.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, [view, data]);

  const viewLabels = {
    visits: "Visits",
    admits: "Admissions",
  };
  

  return (
    <div className="toggle-controls">
      <button
        className={`toggle-button ${view === "visits" ? "active" : ""}`}
        onClick={() => handleToggle("visits")}
      >
        Visits
      </button>
      <button
        className={`toggle-button ${view === "admits" ? "active" : ""}`}
        onClick={() => handleToggle("admits")}
      >
        Admissions
      </button>

      {peak && (
        <div className="chart-peak">
          <p className="peak-label">Peak {viewLabels[view]}</p>
          <p className="peak-value">{peak.value}</p>
          <p className="peak-date">{peak.date}</p>
        </div>
      )}
    </div>
  );
};

ToggleControls.propTypes = {
  data: PropTypes.array.isRequired,
  view: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ToggleControls;
