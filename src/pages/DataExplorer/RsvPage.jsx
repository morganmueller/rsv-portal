// src/pages/RsvPage.jsx
import React from "react";
import { PageStateProvider } from "../../components/hooks/usePageState";
import ConfigDrivenPage from "../../components/layout/ConfigDrivenPage";
import Header from "../../components/Header/Header";
import rsvPageConfig from "../config/virus/RsvPage.config"; // Adjust path if needed

const RsvPage = () => (
  <PageStateProvider enableDataTypeToggle={true}>
    <>
    <Header />
    <ConfigDrivenPage config={rsvPageConfig} />
    </>
  </PageStateProvider>
);

export default RsvPage;
