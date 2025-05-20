import React from "react";
import { useNavigate } from "react-router-dom";
import headerButtons from "./Header.config";
import { getText } from "../../utils/contentUtils"; // i18n helper

const HeaderButtons = ({ activeButton }) => {
  const navigate = useNavigate();

  return (
    <div className="header-buttons">
      {headerButtons
        .filter((btn) => !btn.hidden)
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
            <button
              key={id}
              className={`outline-button ${activeButton === id ? "active" : ""}`}
              onClick={() => navigate(path)}
            >
              {getText(labelKey)}
            </button>
          )
        )}
    </div>
  );
};

export default HeaderButtons;
