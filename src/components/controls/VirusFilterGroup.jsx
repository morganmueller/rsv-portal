import React, { useState } from "react";
import VirusFilterButton from "./VirusFilterButton";
import covidIcon from "../../../public/assets/covid-vector.svg";
import fluIcon from "../../../public/assets/flu-vector.svg";
import rsvIcon from "../../../public/assets/rsv-vector.svg";
import "./VirusFilterButton.css";

const virusOptions = [
  { label: "COVID-19", icon: covidIcon },
  { label: "Influenza", icon: fluIcon },
  { label: "RSV", icon: rsvIcon }
];

const VirusFilterGroup = ({ onChange }) => {
  const [activeVirus, setActiveVirus] = useState("COVID-19");

  const handleClick = (label) => {
    setActiveVirus(label);
    if (onChange) onChange(label);
  };

  return (
    <div style={{ display: "flex", gap: "12px" }}>
      {virusOptions.map(({ label, icon }) => (
        <VirusFilterButton
          key={label}
          label={label}
          icon={icon}
          active={activeVirus === label}
          onClick={() => handleClick(label)}
        />
      ))}
    </div>
  );
};

export default VirusFilterGroup;
