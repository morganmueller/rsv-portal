import React from "react";
import { useLocation } from "react-router-dom";
import HeaderButtons from "./HeaderButtons";
import Dropdown from "./Dropdown";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  let activeButton = "overview";

  if (path.startsWith("/data-explorer")) {
    activeButton = "explorer";
  } else if (path.startsWith("/about")) {
    activeButton = "info";
  }

  return (
    <section className="header-section">
  <div className="header-container">
    <div className="header-content">
      <h1 className="header-title">
      Respiratory Illness Data Tracker
      </h1>
      <p className="header-subtitle">
      Data insights for respiratory illnesses in New York City
      </p>

      <HeaderButtons activeButton={activeButton} />

      {activeButton === "explorer" && (
        <div className="data-dropdown-wrapper">
          <Dropdown />
        </div>
      )}
    </div>

    {/* Add image separately and right-aligned */}
    <div className="header-image-wrapper">
      <img
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fanalyticsintell.com%2Fwp-content%2Fuploads%2F2020%2F06%2FNYC_Health-540px-1-1-300x150.png&f=1&nofb=1&ipt=7fb1ea11033f84918c7072faff8f2e8a917897a4ece8fb0a175bb77a22b8c10a"
        alt="NYC Health Logo"
        className="header-image"
      />
    </div>
  </div>
</section>

  );
};

export default Header;
