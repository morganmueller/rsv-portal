import React, { createContext, useContext, useState } from "react";
import { downloadCSV } from "../../utils/downloadUtils";


export const PageStateContext = createContext();


export const usePageState = () => useContext(PageStateContext);

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
      value={{ activeVirus, setActiveVirus, view, setView, handleDownload, setVirus: setActiveVirus, }}
    >
      {children}
    </PageStateContext.Provider>
  );
};

