import React from "react";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import { PageStateProvider } from "../../components/hooks/usePageState";
import edPageConfig from "../../pages/config/EmergencyDeptPage.config";

const EmergencyDeptPage = () => (
  <PageStateProvider>
    <ConfigDrivenPage config={edPageConfig} enableDataTypeToggle={true}/>
  </PageStateProvider>
);

export default EmergencyDeptPage;
