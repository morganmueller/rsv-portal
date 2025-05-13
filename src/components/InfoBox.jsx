// components/InfoBox.jsx
import React from "react";
import "./InfoBox.css";

const InfoBox = ({ title, children }) => {
  return (
    <div className="info-box">
      {title && <h3 className="info-box-title">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};

export default InfoBox;
