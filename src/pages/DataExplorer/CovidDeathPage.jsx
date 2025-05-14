import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage"; 
import covidDeathPageConfig from "../config/CovidDeathPage.config";

const CovidDeathPage = () => {
  return (
    <PageStateProvider initialData={covidDeathPageConfig.data}>
      <ConfigDrivenPage config={covidDeathPageConfig} />
    </PageStateProvider>
  );
};

export default CovidDeathPage;
