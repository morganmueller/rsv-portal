import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import VirusFilterGroup, { virusOptions } from "./VirusFilterGroup";
import DataTypeToggleGroup from "./DataTypeToggleGroup";
import "./FloatingTogglePill.css";

const FloatingTogglePill = ({
  activeVirus,
  dataType,
  view,
  viewLabel,
  onVirusChange,
  onDataTypeChange,
  onViewChange,
  controls = {},
  className = ""
}) => {
  const { virusToggle = true, viewToggle = true, dataTypeToggle = true } = controls;

  const [open, setOpen] = useState(false);
  const [isChoosingNewVirus, setIsChoosingNewVirus] = useState(!activeVirus);

  const [stagedVirus, setStagedVirus] = useState(activeVirus || "");
  const [stagedDataType, setStagedDataType] = useState(dataType || "");
  const [stagedView, setStagedView] = useState(view || "");

  // Only sync staged state from props when the modal is closed (to avoid wiping in-progress selection)
  useEffect(() => {
    if (!open) {
      setStagedVirus(activeVirus);
      setStagedDataType(dataType);
      setStagedView(view);
      setIsChoosingNewVirus(!activeVirus);
    }
  }, [activeVirus, dataType, view, open]);

  const allDataTypeOptions = [
    { label: "Emergency Department Data", value: "ed" },
    { label: "Lab-confirmed Cases", value: "lab" },
    { label: "COVID-19 Deaths", value: "death" }
  ];

  const filteredDataTypeOptions =
    stagedVirus === "Influenza" || stagedVirus === "RSV"
      ? allDataTypeOptions.filter((opt) => opt.value !== "death")
      : allDataTypeOptions;

  const icon = virusOptions.find((v) => v.label === stagedVirus)?.icon;
  const dataTypeLabel =
    filteredDataTypeOptions.find((opt) => opt.value === stagedDataType)?.label ?? "";

  // Commit virus immediately on click
  const handleVirusSelect = (v) => {
    setStagedVirus(v);
    if (v !== activeVirus) {
      onVirusChange(v);
      setOpen(false);
      setIsChoosingNewVirus(false);
    } else {
      // Just advance
      setIsChoosingNewVirus(false);
    }
  };

  // Commit data type immediately on click
  const handleDataTypeSelect = (v) => {
    setStagedDataType(v);
    if (v !== dataType) {
      onDataTypeChange(v);
      setOpen(false);
    }
  };

  const handleReset = () => {
    setStagedVirus("");
    setStagedDataType("");
    setStagedView("");
    setIsChoosingNewVirus(true);
    setOpen(true);
  };

  return (
    <div className={`floating-pill ${className} ${open ? "open" : ""}`}>
      {!isChoosingNewVirus && activeVirus && !open ? (
        <button className="pill-button" onClick={() => setOpen(true)}>
          {icon && (
            <img
              src={icon}
              alt={activeVirus}
              className="filter-icon"
              style={{ marginRight: "6px", width: "14px", height: "14px" }}
            />
          )}
          {activeVirus} | {dataTypeLabel}
          <span className="arrow">▼</span>
        </button>
      ) : (
        <>
          <button className="pill-button" onClick={() => setOpen(!open)}>
            {isChoosingNewVirus ? "Select Virus" : "Continue Selection"}
            <span className="arrow">▼</span>
          </button>

          {open && (
            <div className="pill-dropdown">
              {isChoosingNewVirus && (
                <div className="pill-section">
                  <label>Choose a virus</label>
                  <VirusFilterGroup
                    activeVirus={stagedVirus}
                    onChange={handleVirusSelect}
                  />
                </div>
              )}

              {!isChoosingNewVirus && dataTypeToggle && (
                <div className="pill-section">
                  <label>Choose a data type</label>
                  <DataTypeToggleGroup
                    options={filteredDataTypeOptions}
                    activeType={stagedDataType}
                    onChange={handleDataTypeSelect}
                  />
                </div>
              )}

              {/* Uncomment to add view toggle logic in future */}
              {/* {!isChoosingNewVirus && stagedDataType === "ed" && viewToggle && (
                <div className="pill-section">
                  <label>Choose a view</label>
                  <ViewToggleGroup
                    activeView={stagedView}
                    onChange={(v) => setStagedView(v)}
                  />
                </div>
              )} */}

              <button
                className="toggle-button pill-reset-button"
                onClick={handleReset}
              >
                {activeVirus ? "Change Virus" : "Reset"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

FloatingTogglePill.propTypes = {
  activeVirus: PropTypes.string.isRequired,
  dataType: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  viewLabel: PropTypes.string.isRequired,
  onVirusChange: PropTypes.func.isRequired,
  onDataTypeChange: PropTypes.func.isRequired,
  onViewChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  controls: PropTypes.shape({
    virusToggle: PropTypes.bool,
    viewToggle: PropTypes.bool,
    dataTypeToggle: PropTypes.bool
  })
};

export default FloatingTogglePill;
