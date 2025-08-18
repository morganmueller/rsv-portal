import React from "react";
import PropTypes from "prop-types";
import "../layout/TrendSummaryContainer.css"

const GroupDropdown = ({
    label = "Group",
    options = [],
    active,
    onChange,
    inline = false,
  }) => {
    // Add your alias mapping here too
    const groupDisplayNames = {
      Bronx: "the Bronx",
      "0-4": "ages 0–4",
      "5-17": "ages 5–17",
      "18-64": "ages 18–64",
      "65+": "ages 65+",
      "All Ages": "all age groups",
      "All Boroughs": "all boroughs",
    };
  
    const selectStyles = {
      fontSize: 14,
      padding: "4px 8px",
      ...(inline
        ? {
            marginLeft: 4,
            display: "inline-block",
            fontWeight: 600,
            textDecoration: "underline",
            backgroundColor: "transparent",
            border: "none",
            color: "var(--blueAccent)",
            cursor: "pointer",
          }
        : {
            display: "block",
            marginTop: 4,
          }),
    };
  
    return inline ? (
      <select
        value={active || ""}
        onChange={(e) => onChange(e.target.value)}
        className="trend-subtitle-select"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {groupDisplayNames[opt] || opt}
          </option>
        ))}
      </select>
    ) : (
      <label style={{ display: "block", fontSize: 14, marginBottom: 8 }}>
        {label}
        <select
          value={active || ""}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyles}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {groupDisplayNames[opt] || opt}
            </option>
          ))}
        </select>
      </label>
    );
  };
  

GroupDropdown.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  active: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  inline: PropTypes.bool, // ✅ Optional prop for subtitle usage
};

export default GroupDropdown;
