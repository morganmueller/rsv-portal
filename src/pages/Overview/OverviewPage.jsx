import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import overviewConfig from "../config/OverviewPage.config";
import Header from "../../components/Header/Header";

import "./OverviewPageLayout.css";

const OverviewPage = () => {
  return (
    <PageStateProvider enableVirusToggle={false} enableDataTypeToggle={false}>
      <>
      <Header />
      <ConfigDrivenPage config={overviewConfig} />
      </>
    </PageStateProvider>
  );
};

export default OverviewPage;
