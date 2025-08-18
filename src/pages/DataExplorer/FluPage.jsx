import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import Header from "../../components/Header/Header";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import fluPageConfig from "../config/virus/FluPage.config"; // Adjust path if needed

const FluPage = () => (
  <PageStateProvider enableDataTypeToggle={true}>
    <>     
          <Header />

    <ConfigDrivenPage config={fluPageConfig} />
    </>
  </PageStateProvider>
);

export default FluPage;
