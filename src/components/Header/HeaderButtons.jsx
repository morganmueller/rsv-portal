import React from "react";
import { useNavigate } from "react-router-dom";
import headerButtons from "./Header.config";
import Dropdown from "./Dropdown";
import { getText } from "../../utils/contentUtils"; // i18n helper
import "./Header.css";

const HeaderButtons = ({ activeButton }) => {
  const navigate = useNavigate();

  return (
    <div className="header-buttons-wrapper">
      {/* Left-aligned buttons */}
      <div className="left-buttons">
        {headerButtons
          .filter((btn) => btn.id !== "info" && !btn.hidden)
          .map(({ id, labelKey, path, external }) =>
            external ? (
              <a
                key={id}
                href={path}
                className={`outline-button ${activeButton === id ? "active" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {getText(labelKey)}
              </a>
            ) : (
              <div key={id} className={id === "data" ? "button-with-dropdown" : ""}>
                <button
                  className={`outline-button ${activeButton === id ? "active" : ""}`}
                  onClick={() => navigate(path)}
                >
                  {getText(labelKey)}
                </button>
                {id === "data" && activeButton === "data" && (
                  <div className="inline-dropdown">
                    <Dropdown />
                  </div>
                )}
              </div>
            )
          )}
      </div>

      {/* Right-aligned button */}
      <div className="right-buttons">
        {headerButtons
          .filter((btn) => btn.id === "info")
          .map(({ id, labelKey, path }) => (
            <button
              key={id}
              className={`outline-button ${activeButton === id ? "active" : ""}`}
              onClick={() => navigate(path)}
            >
              {getText(labelKey)}
            </button>
          ))}
      </div>
    </div>
  );
};

export default HeaderButtons;