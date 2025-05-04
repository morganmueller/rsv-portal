import React from "react";
import PropTypes from "prop-types";
import "./VisitAdmitToggle.css";

const ViewToggleGroup = ({ activeView, onChange }) => {
  return (
    <div className="view-toggle-group">
      <button
        className={`view-toggle ${activeView === "visits" ? "active" : ""}`}
        onClick={() => onChange("visits")}
      >
        Visits
      </button>
      <button
        className={`view-toggle ${activeView === "admits" ? "active" : ""}`}
        onClick={() => onChange("admits")}
      >
        Admits
      </button>
    </div>
  );
};

ViewToggleGroup.propTypes = {
  activeView: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ViewToggleGroup;
