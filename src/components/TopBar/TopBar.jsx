import React, { useState } from "react";
import "./TopBar.css";

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        <a href="https://www.nyc.gov/" target="_blank" rel="noopener noreferrer">
          <img
            src="https://a816-dohbesp.nyc.gov/IndicatorPublic/images/nyc-bubble-logo.svg"
            alt="NYC Health Logo"
            className="top-bar-logo-image desktop-only"
          />
        </a>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className={`top-bar-nav ${menuOpen ? "open" : ""}`}>
          <a href="https://www.nyc.gov/" target="_blank" rel="noopener noreferrer">
            <img
              src="https://a816-dohbesp.nyc.gov/IndicatorPublic/images/nyc-bubble-logo.svg"
              alt="NYC Health Logo"
              className="top-bar-logo-image mobile-only"
            />
          </a>

          <div className="top-bar-nav-item">
            <label htmlFor="language-select-mobile" className="visually-hidden">Language</label>
            <select
              id="language-select-mobile"
              className="language-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="top-bar-nav-item theme-toggle-wrapper">
            <span className="theme-label">{theme === "dark" ? "Dark" : "Light"} Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
              <span className="slider">
              <span className="icon">{theme === "dark" ? "🌙" : "☀️"}</span>

              </span>

            </label>
          </div>
        </div>

        <div className="top-bar-extras desktop-only">
          <label htmlFor="language-select" className="visually-hidden">Language</label>
          <select
            id="language-select"
            className="language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="zh">中文</option>
          </select>

          <div className="theme-toggle-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={toggleTheme}
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
