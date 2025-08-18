import React, { createContext, useContext, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { downloadCSV } from "../../utils/downloadUtils";
import { virusSlugMap } from "../../utils/virusSlugs";

export const PageStateContext = createContext();
export const usePageState = () => useContext(PageStateContext);

export const PageStateProvider = ({
  children,
  initialData = [],
  enableVirusToggle = true,
  enableDataTypeToggle = false,
  initialDataType = "ed",  
}) => {
  const { virus: virusParam } = useParams(); 
  const navigate = useNavigate();

  const [view, setView] = useState("visits");

  // The ONLY source of truth for activeVirus:
  const activeVirus = useMemo(() => {
    if (!enableVirusToggle) return null;
    if (!virusParam) return "COVID-19";
    const found = Object.entries(virusSlugMap).find(([, slug]) => slug === virusParam);
    if (found) return found[0];
    // fallback for unrecognized param
    return virusParam.charAt(0).toUpperCase() + virusParam.slice(1).toLowerCase();
  }, [virusParam, enableVirusToggle]);

  // The ONLY setter:
  const updateVirus = (newVirus) => {
    const slug = virusSlugMap[newVirus] || newVirus.toLowerCase();
    navigate(`/data/${slug}`);
  };

  const [dataType, setDataType] = useState(
    enableDataTypeToggle ? initialDataType || "ed" : null
  );

  // Data type fix for viruses that do not support deaths
  React.useEffect(() => {
    if ((activeVirus === "Influenza" || activeVirus === "RSV") && dataType === "death") {
      setDataType("ed"); 
    }
  }, [activeVirus, dataType]);

  const handleDownload = () => {
    const filtered = initialData.map(({ week, season, visits }) => ({
      week,
      season,
      [view]: visits,
    }));
    const prefix =
      enableVirusToggle && activeVirus
        ? `${activeVirus.toLowerCase()}-`
        : enableDataTypeToggle && dataType
        ? `${dataType}-`
        : "";
    downloadCSV(filtered, `${prefix}${view}-seasonal.csv`);
  };

  return (
    <PageStateContext.Provider
      value={{
        view,
        setView,
        handleDownload,
        activeVirus,
        setActiveVirus: updateVirus, // always updates the route, never state
        setVirus: updateVirus,
        dataType,
        setDataType,
      }}
    >
      {children}
    </PageStateContext.Provider>
  );
};
