import React from "react";
import PropTypes from "prop-types";
import VirusFilterGroup from "../controls/VirusFilterGroup";
import ViewToggleGroup from "../controls/VisitAdmitToggle";
import { usePageState } from "../../components/hooks/usePageState";
import "./DataPageLayout.css"
const TopControls = ({ controls = {} }) => {
  const { view, setView, activeVirus, setActiveVirus } = usePageState();
  const { virusToggle, viewToggle } = controls;

  return (
    <>
{virusToggle && (
  <div className="data-filter-group">
    <span className="data-filter-label">Virus</span>
    <VirusFilterGroup onChange={setActiveVirus} />
  </div>
)}

{viewToggle && (
  <div className="data-filter-group right-aligned">
    <span className="data-filter-label">Choose Between</span>
    <ViewToggleGroup activeView={view} onChange={setView} />
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
};

export default TopControls;
