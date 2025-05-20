import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import overviewConfig from "../config/OverviewPage.config";
import "./OverviewPageLayout.css";

const OverviewPage = () => {
  return (
    <PageStateProvider enableVirusToggle={false}>
      <ConfigDrivenPage config={overviewConfig} />
    </PageStateProvider>
  );
};

export default OverviewPage;
