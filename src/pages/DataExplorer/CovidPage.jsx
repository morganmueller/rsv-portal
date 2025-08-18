import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import Header from "../../components/Header/Header";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import covidPageConfig from "../config/virus/CovidPage.config";

const CovidPage = () => (
  <PageStateProvider enableDataTypeToggle={true}>
    <>
      <Header />
      <ConfigDrivenPage config={covidPageConfig} />
    </>
  </PageStateProvider>
);

export default CovidPage;
