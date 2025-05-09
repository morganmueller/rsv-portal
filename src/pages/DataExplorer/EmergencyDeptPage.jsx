import React from "react";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage"; 
import edPageConfig from "../../pages/config/EmergencyDeptPage.config";
import { PageStateProvider } from "../../components/hooks/usePageState";

const EmergencyDeptPage = () => {
  return (
    <PageStateProvider initialData={edPageConfig.data}>
      <ConfigDrivenPage config={edPageConfig} /> 
    </PageStateProvider>
  );
};

export default EmergencyDeptPage;
