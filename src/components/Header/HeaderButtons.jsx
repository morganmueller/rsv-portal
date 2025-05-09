import React from "react";
import { useNavigate } from "react-router-dom";

const HeaderButtons = ({ activeButton }) => {
  const navigate = useNavigate();

  return (
    <div className="header-buttons">
      <button
        className={`outline-button ${activeButton === "overview" ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        Overview
      </button>
      <button
        className={`outline-button ${activeButton === "explorer" ? "active" : ""}`}
        onClick={() => navigate("/data-explorer")}
      >
        Data Explorer
      </button>
      <button
        className={`outline-button ${activeButton === "info" ? "active" : ""}`}
        onClick={() => navigate("/about")}
      >
        About
      </button>
    </div>
  );
};

export default HeaderButtons;
