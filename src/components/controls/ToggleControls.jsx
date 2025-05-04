import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import "./ToggleControls.css";

const ToggleControls = ({ data, onToggle }) => {
  const [view, setView] = useState("visits");

  const handleToggle = (type) => {
    setView(type);
    if (onToggle) onToggle(type);
  };

  const peak = useMemo(() => {
    if (!data || data.length === 0) return null;
    const max = data.reduce((a, b) => a[view] > b[view] ? a : b);
    return {
      value: max[view].toLocaleString(),
      date: new Date(max.week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }, [view, data]);

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
        Admits
      </button>

      {peak && (
        <div className="chart-peak">
          <p className="peak-label">Peak {view.charAt(0).toUpperCase() + view.slice(1)}</p>
          <p className="peak-value">{peak.value}</p>
          <p className="peak-date">{peak.date}</p>
        </div>
      )}
    </div>
  );
};

ToggleControls.propTypes = {
  data: PropTypes.array.isRequired,
  onToggle: PropTypes.func,
};

export default ToggleControls;
