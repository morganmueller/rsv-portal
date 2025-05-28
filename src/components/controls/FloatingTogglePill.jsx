import React, { useState } from "react";
import PropTypes from "prop-types";
import VirusFilterGroup from "./VirusFilterGroup";
import ViewToggleGroup from "./VisitAdmitToggle";
import { virusOptions } from "./VirusFilterGroup";

import "./FloatingTogglePill.css";

const FloatingTogglePill = ({
  activeVirus,
  view,
  viewLabel,
  onVirusChange,
  onViewChange,
  controls = {},
  className = ""

}) => {
  const [open, setOpen] = useState(false);
  const { virusToggle = true, viewToggle = true } = controls;
  const activeIcon = virusOptions.find((v) => v.label === activeVirus)?.icon;

  if (!virusToggle && !viewToggle) return null;

  return (
<div className={`floating-pill ${className} ${open ? "open" : ""}`}>
<button className={`pill-button ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
        <>
          {activeIcon && (
            <img
              src={activeIcon}
              alt={activeVirus}
              className="filter-icon"
              style={{ marginRight: "8px" }}
            />
          )}
          {activeVirus}
          {viewToggle && ` | ${viewLabel}`}
          <span className="arrow">▼</span>
        </>
      </button>

      {open && (
        <div className="pill-dropdown">
          {virusToggle && (
            <div className="pill-section">
              <label>Virus:</label>
              <VirusFilterGroup
                activeVirus={activeVirus}
                onChange={(v) => {
                  onVirusChange(v);
                  setOpen(false);
                }}
              />
            </div>
          )}

          {viewToggle && (
            <div className="pill-section">
              <label>View:</label>
              <ViewToggleGroup
                activeView={view}
                onChange={(v) => {
                  onViewChange(v);
                  setOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

FloatingTogglePill.propTypes = {
  activeVirus: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  viewLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
  onVirusChange: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  controls: PropTypes.shape({
    virusToggle: PropTypes.bool,
    viewToggle: PropTypes.bool,
  }),
};

export default FloatingTogglePill;
