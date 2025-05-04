import React, { useState } from "react";
import "./TopBar.css";

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="top-bar">
      <div className="top-bar-container">
        {/* <img src="/assets/topline-header.png" alt="NYC Health Logo" className="top-bar-logo-image" /> */}


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
          <div className="nav-link">Home</div>
          <div className="nav-link">Data</div>
          <div className="nav-link">About</div>
        </div>

        <div className="top-bar-search">
          <input className="search-input" type="text" placeholder="Search..." />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
