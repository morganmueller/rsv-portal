import React from "react";
import PropTypes from "prop-types";
import "./VirusFilterButton.css";

const VirusFilterButton = ({ label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`filter-button ${active ? "active" : ""}`}
    >
      <img src={icon} alt={label} className="filter-icon" />
      {label}
    </button>
  );
};

VirusFilterButton.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

export default VirusFilterButton;
