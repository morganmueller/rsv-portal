import React from "react";
import PropTypes from "prop-types";
import VirusFilterButton from "./VirusFilterButton";
import covidIcon from "../../../public/assets/covid-vector.svg";
import fluIcon from "../../../public/assets/flu-vector.svg";
import rsvIcon from "../../../public/assets/rsv-vector.svg";
import "./VirusFilterButton.css";

export const virusOptions = [
  { label: "COVID-19", icon: covidIcon },
  { label: "Influenza", icon: fluIcon },
  { label: "RSV", icon: rsvIcon }
];

const VirusFilterGroup = ({ activeVirus, onChange }) => {
  return (
    <div className="virus-filter-group">
      {virusOptions.map(({ label, icon }) => (
        <VirusFilterButton
          key={label}
          label={label}
          icon={icon}
          active={activeVirus === label}
          onClick={() => onChange(label)}
        />
      ))}
    </div>
  );
};

VirusFilterGroup.propTypes = {
  activeVirus: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default VirusFilterGroup;
