import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Dropdown = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTopic = location.pathname.split("/")[2] || "emergency-dept";

  const handleChange = (e) => {
    const value = e.target.value;
    if (value !== currentTopic) {
      navigate(`/data/${value}`);
    }
  };

  return (
    <div className="dropdown-block">
      <label htmlFor="data-topic-select" className="dropdown-label sr-only">
        Explore different topics:
      </label>
      <select
        id="data-topic-select"
        className="data-topic-select nav-pill"
        onChange={handleChange}
        value={currentTopic}
        aria-label="Select a data topic"
        aria-describedby="dropdown-hint"
        role="combobox"
      >
        <option value="emergency-dept">Emergency Department Data</option>
        <option value="cases">Lab-Reported Cases</option>
        <option value="deaths">COVID-19 Deaths</option>
      </select>
      <span id="dropdown-hint" className="dropdown-hint sr-only">
        ⓘ Page will update automatically
      </span>
    </div>
  );
};

export default Dropdown;
