import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import Header from "../../components/Header/Header";
import AboutPageLayout from "../../components/layout/AboutPageLayout";
import aboutPageConfig from "../config/AboutPage.config";

const AboutPage = () => {
  return (
    <PageStateProvider enableVirusToggle={false} enableDataTypeToggle={false}>
      <>
        <Header />
        <AboutPageLayout config={aboutPageConfig} />
      </>
    </PageStateProvider>
  );
};

export default AboutPage;
