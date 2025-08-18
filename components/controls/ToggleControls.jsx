import React from "react";
import PropTypes from "prop-types";
import "./ToggleControls.css";

const ToggleControls = ({ data, view, onToggle }) => {
  const handleToggle = (type) => {
    if (onToggle && type !== view) onToggle(type);
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
        className={`toggle-button ${view === "hospitalizations" ? "active" : ""}`}
        onClick={() => handleToggle("hospitalizations")}
      >
        Hospitalizations
      </button>
    </div>
  );
};

ToggleControls.propTypes = {
  data: PropTypes.array.isRequired,
  view: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ToggleControls;
