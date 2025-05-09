import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Dropdown = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current topic from pathname
  const currentTopic = location.pathname.split("/")[2] || "emergency-dept";

  const handleChange = (e) => {
    const value = e.target.value;
    if (value !== currentTopic) {
      navigate(`/data-explorer/${value}`);
    }
  };

  return (
    <select
      className="data-topic-select"
      onChange={handleChange}
      value={currentTopic}
    >
      <option value="emergency-dept">Emergency Department Visits and Admits</option>
      <option value="cases">Lab-Reported Cases</option>
      <option value="deaths">COVID-19 Deaths</option>
    </select>
  );
};

export default Dropdown;
