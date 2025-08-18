import React from "react";
import { useLocation } from "react-router-dom";
import HeaderButtons from "./HeaderButtons";
import { usePageState } from "../hooks/usePageState";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  // This context will now always be defined!
  const { activeVirus, setVirus } = usePageState();

  let activeButton = "home";
  if (path.startsWith("/data")) activeButton = "data";
  else if (path.startsWith("/info")) activeButton = "info";

  return (
    <>
      <section className="header-section">
        <div className="header-container">
          <div className="header-content">
            <h1 className="header-title">Respiratory Illness Data</h1>
          </div>
        </div>
      </section>

      <HeaderButtons
        activeButton={activeButton}
        activeVirus={activeVirus}
        onVirusChange={setVirus}
        virusToggle={activeButton === "data"} // show virus buttons only on /data
      />
    </>
  );
};

export default Header;
