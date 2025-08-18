// VirusDataPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { PageStateProvider } from "../../components/hooks/usePageState";
import Header from "../../components/Header/Header";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";

// Import all your configs
import covidPageConfig from "../config/virus/CovidPage.config";
import fluPageConfig from "../config/virus/FluPage.config";
import rsvPageConfig from "../config/virus/RsvPage.config";

const configBySlug = {
  "covid-19": covidPageConfig,
  "influenza": fluPageConfig,
  "rsv": rsvPageConfig,
};

const VirusDataPage = () => {
  const { virus } = useParams();
  const config = configBySlug[virus] || covidPageConfig; // fallback to COVID-19 config

  return (
    <PageStateProvider enableDataTypeToggle={true}>
      <>
        <Header />
        <ConfigDrivenPage config={config} />
      </>
    </PageStateProvider>
  );
};

export default VirusDataPage;
