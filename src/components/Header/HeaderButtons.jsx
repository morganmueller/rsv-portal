import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import headerButtons from "./Header.config";
import VirusFilterGroup from "../controls/VirusFilterGroup";
import { getText } from "../../utils/contentUtils";
import "./Header.css";

const HeaderButtons = ({
  activeButton,
  activeVirus,
  onVirusChange,
  virusToggle = false,
}) => {
  const navigate = useNavigate();

  const handleVirusClick = (label) => {
    onVirusChange?.(label);
    const slug = (label || "").toLowerCase();
    navigate(`/data/${slug}`);
  };

  // Desktop/tablet: replace Data button with virus buttons when Data is active
  const isDataActive = activeButton === "data" && !!virusToggle;

  return (
    <>
      <div className={`header-buttons-wrapper ${isDataActive ? "is-data-active" : ""}`}>
        {/* Left group: Home + Data (or Virus buttons when Data active) */}
        <div className="left-buttons">
          {headerButtons
            .filter((btn) => btn.id !== "about" && !btn.hidden)
            .map(({ id, labelKey, path, external }) => {
              const isActive = activeButton === id;

              // Replace Data with VirusFilterGroup on desktop/tablet only
              if (id === "data" && isDataActive) {
                return (
                  <span key="virus-inline" className="virus-inline-slot desktop-only">
                    <VirusFilterGroup
                      activeVirus={activeVirus}
                      onChange={handleVirusClick}
                    />
                  </span>
                );
              }

              const commonClass = `outline-button btn-${id} ${isActive ? "active" : ""}`;

              if (external) {
                return (
                  <a
                    key={id}
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={commonClass}
                  >
                    {getText(labelKey)}
                  </a>
                );
              }

              return (
                <button
                  key={id}
                  type="button"
                  className={commonClass}
                  onClick={() => navigate(path)}
                >
                  {getText(labelKey)}
                </button>
              );
            })}
        </div>

        {/* Right group: about page */}
        <div className="right-buttons">
          {headerButtons
            .filter((btn) => btn.id === "about")
            .map(({ id, labelKey, path }) => {
              const isActive = activeButton === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`outline-button btn-${id} ${isActive ? "active" : ""}`}
                  onClick={() => navigate(path)}
                >
                  {getText(labelKey)}
                </button>
              );
            })}
        </div>

        {/* Mobile-only virus row when Data is active */}
        {isDataActive && (
          <div className="mobile-virus-row mobile-only" aria-label="Virus filters">
            <VirusFilterGroup activeVirus={activeVirus} onChange={handleVirusClick} />
          </div>
        )}
      </div>
    </>
  );
};

HeaderButtons.propTypes = {
  activeButton: PropTypes.string.isRequired, // "home" | "data" | "info"
  activeVirus: PropTypes.string,
  onVirusChange: PropTypes.func,
  virusToggle: PropTypes.bool,
};

export default HeaderButtons;
