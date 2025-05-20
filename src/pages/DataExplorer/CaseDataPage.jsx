import React from "react";
import { PageStateProvider} from "../../components/hooks/usePageState";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import caseDataPageConfig from "../../pages/config/CaseDataPage.config";


const CaseDataPage = () => (
  <PageStateProvider>
    <ConfigDrivenPage config={caseDataPageConfig} />
  </PageStateProvider>
);

export default CaseDataPage;
