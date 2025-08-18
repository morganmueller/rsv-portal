// src/components/layout/TopBar.jsx
import React, { useEffect, useState } from "react";
import LanguageToggle from "../contentUtils/LanguageToggle"; // keep/select correct path
import "./TopBar.css";

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    // notranslate prevents Google from altering the bar’s UI text
    <div className="top-bar notranslate">
      <div className="top-bar-container">
        <a href="https://www.nyc.gov/" target="_blank" rel="noopener noreferrer">
          <img
            src="https://a816-dohbesp.nyc.gov/IndicatorPublic/images/nyc-bubble-logo.svg"
            alt="NYC Health Logo"
            className="top-bar-logo-image"
          />
        </a>

        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="top-bar-nav"
          type="button"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        {/* Mobile / collapsed nav */}
        <div
          id="top-bar-nav"
          className={`top-bar-nav ${menuOpen ? "open" : ""}`}
        >
          <div className="top-bar-nav-item">
            {/* Apply styling to the actual <select> via className.
                wrapperClassName is just layout spacing for the label wrapper. */}
            <LanguageToggle
              className="language-select"
              wrapperClassName="top-bar-nav-item"
            />
          </div>

          <div className="top-bar-nav-item theme-toggle-wrapper">
            <span className="theme-label">
              {theme === "dark" ? "Dark" : "Light"} Mode
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
              <span className="slider">
                <span className="icon">{theme === "dark" ? "🌙" : "☀️"}</span>
              </span>
            </label>
          </div>
        </div>

        {/* Desktop extras (always visible on desktop) */}
        <div className="top-bar-extras desktop-only">
          <LanguageToggle
            className="language-select"
            wrapperClassName="top-bar-nav-item"
          />

          <div className="theme-toggle-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label="Toggle dark mode"
              />
              <span className="slider">
                <span className="icon">{theme === "dark" ? "🌙" : "☀️"}</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
