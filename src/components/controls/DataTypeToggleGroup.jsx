import React from "react";
import PropTypes from "prop-types";
import "./DataTypeToggleGroup.css";

const DataTypeToggleGroup = ({ options, activeType, onChange }) => {
  return (
    <div className="data-type-toggle-group">
      {options.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`view-toggle ${activeType === value ? "active" : ""}`}
          >
          {label}
        </button>
      ))}
    </div>
  );
};

DataTypeToggleGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ).isRequired,
  activeType: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DataTypeToggleGroup;
