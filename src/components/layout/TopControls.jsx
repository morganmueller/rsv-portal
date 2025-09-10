import React from "react";
import PropTypes from "prop-types";
import DataTypeToggleGroup from "../controls/DataTypeToggleGroup";
import ViewToggleGroup from "../controls/VisitAdmitToggle";
import VirusFilterGroup from "../controls/VirusFilterGroup";
import "./DataPageLayout.css";

const TopControls = ({
  controls = {},
  activeVirus,
  onVirusChange,
  dataType,
  onDataTypeChange,
  view,
  onViewChange,
}) => {
  const { virusToggle, dataTypeToggle, viewToggle } = controls;

  const allOptions = [
    { label: "Emergency Department Data", value: "ed" },
    { label: "Lab-reported Cases", value: "lab" },
    { label: "COVID-19 Deaths", value: "death" },
  ];
  
  const dataTypeOptions =
    activeVirus === "Influenza" || activeVirus === "RSV"
      ? allOptions.filter((opt) => opt.value !== "death") 
      : allOptions;
  
      console.log("TopControls dataType:", dataType);

  return (
    <div className="top-controls-wrapper">
      {virusToggle && (
        <div className="virus-filter-group-wrapper">
          <span className="data-filter-label sr-only">Virus</span>
          <VirusFilterGroup activeVirus={activeVirus} onChange={onVirusChange} />
        </div>
      )}

      {dataTypeToggle && (
        <div className="data-type-toggle-wrapper">
          <span className="data-filter-label sr-only">Data Type</span>
          <DataTypeToggleGroup
            options={dataTypeOptions}
            activeType={dataType}
            onChange={onDataTypeChange}
          />
        </div>
      )}

      {viewToggle && dataType === "ed" && (
        <div className="view-toggle-wrapper">
          <span className="data-filter-label sr-only">Choose Between</span>
          <ViewToggleGroup activeView={view} onChange={onViewChange} />
        </div>
      )}
    </div>
  );
};

TopControls.propTypes = {
  controls: PropTypes.shape({
    virusToggle: PropTypes.bool,
    dataTypeToggle: PropTypes.bool,
    viewToggle: PropTypes.bool,
  }),
  activeVirus: PropTypes.string,
  onVirusChange: PropTypes.func,
  dataType: PropTypes.string,
  onDataTypeChange: PropTypes.func,
  view: PropTypes.string,
  onViewChange: PropTypes.func,
};

export default TopControls;
