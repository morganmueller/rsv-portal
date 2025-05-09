import React, { createContext, useContext, useState } from "react";
import { downloadCSV } from "../../utils/downloadUtils";

// 1. Context
export const PageStateContext = createContext();

// 2. Hook
export const usePageState = () => useContext(PageStateContext);

// 3. Provider
export const PageStateProvider = ({ children, initialData }) => {
  const [activeVirus, setActiveVirus] = useState("COVID-19");
  const [view, setView] = useState("visits");

  const handleDownload = () => {
    const filtered = initialData.map(({ week, season, visits }) => ({
      week,
      season,
      [view]: visits
    }));
    downloadCSV(filtered, `${activeVirus.toLowerCase()}-${view}-seasonal.csv`);
  };

  return (
    <PageStateContext.Provider
      value={{ activeVirus, setActiveVirus, view, setView, handleDownload }}
    >
      {children}
    </PageStateContext.Provider>
  );
};
