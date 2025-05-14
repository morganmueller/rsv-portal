import React, { createContext, useContext, useState } from "react";
import { downloadCSV } from "../../utils/downloadUtils";

// 1. Context
export const PageStateContext = createContext();

// 2. Hook
export const usePageState = () => useContext(PageStateContext);

// 3. Provider
export const PageStateProvider = ({ children, initialData = [], enableVirusToggle = true }) => {
  const [view, setView] = useState("visits");
  const [activeVirus, setActiveVirus] = useState(enableVirusToggle ? "COVID-19" : null);

  const handleDownload = () => {
    const filtered = initialData.map(({ week, season, visits }) => ({
      week,
      season,
      [view]: visits
    }));
    const virusPrefix = enableVirusToggle && activeVirus ? `${activeVirus.toLowerCase()}-` : "";
    downloadCSV(filtered, `${virusPrefix}${view}-seasonal.csv`);
  };

  return (
    <PageStateContext.Provider
      value={{ activeVirus, setActiveVirus, view, setView, handleDownload }}
    >
      {children}
    </PageStateContext.Provider>
  );
};

