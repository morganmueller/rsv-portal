import React from "react";
import PropTypes from "prop-types";
import VirusFilterGroup from "../controls/VirusFilterGroup";
import ViewToggleGroup from "../controls/VisitAdmitToggle";
import { usePageState } from "../../components/hooks/usePageState";
import "./DataPageLayout.css"

const TopControls = ({
  controls = {},
  activeVirus,
  onVirusChange,
  view,
  onViewChange,
}) => {
  const { virusToggle, viewToggle } = controls;

  return (
    <>
      {virusToggle && (
        <div className="data-filter-group">
          <span className="data-filter-label sr-only">Virus</span>
          <VirusFilterGroup activeVirus={activeVirus} onChange={onVirusChange} />
        </div>
      )}

      {viewToggle && (
        <div className="data-filter-group right-aligned">
          <span className="data-filter-label sr-only">Choose Between</span>
          <ViewToggleGroup activeView={view} onChange={onViewChange} />
        </div>
      )}
    </>
  );
};

TopControls.propTypes = {
  controls: PropTypes.shape({
    virusToggle: PropTypes.bool,
    viewToggle: PropTypes.bool,
  }),
  activeVirus: PropTypes.string,
  onVirusChange: PropTypes.func,
  view: PropTypes.string,
  onViewChange: PropTypes.func,
};


export default TopControls;
