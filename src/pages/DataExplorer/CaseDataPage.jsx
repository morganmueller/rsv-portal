import React, { useState, useMemo } from "react";
import DataPageLayout from "../../components/layout/DataPageLayout";
import VirusFilterGroup from "../../components/controls/VirusFilterGroup";
import ViewToggleGroup from "../../components/controls/VisitAdmitToggle";
import ContentContainer from "../../components/layout/ContentContainer";
import DataSummarySection from "../../components/sections/DataSummarySection";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import ChartContainer from "../../components/layout/ChartContainer";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";

const CaseDataPage = () => {

    const [activeVirus, setActiveVirus] = useState("COVID-19");
  const [view, setView] = useState("visits");

  const handleVirusChange = (virus) => setActiveVirus(virus);


  const handleDownload = () => {
    const filtered = chartData.map(({ week, season, visits }) => ({
      week,
      season,
      [view]: visits,
    }));
    downloadCSV(filtered, `${activeVirus.toLowerCase()}-${view}-seasonal.csv`);
  };

  return (
    <DataPageLayout
      title={getText("caseDataPage.mainTitle")}
      subtitle={getText("caseDataPage.mainSubtitle")}
      topControls={
        <>
          <VirusFilterGroup onChange={handleVirusChange} />
          <ViewToggleGroup activeView={view} onChange={setView} />
        </>
      }
    >
      <ContentContainer
        title={`${activeVirus} Case Data Trends`}
        subtitle={`Explore trends in ED visits and admissions for ${activeVirus}.`}
        animateOnScroll
        infoIcon
        downloadIcon
        modalTitle="About These Metrics"
        modalContent={
          <MarkdownRenderer
            filePath="../../content/modals/metric-explainer.md"
            showTitle
            sectionTitle="Seasonal ED Visits"
          />
        }
      >
        <div style={{ padding: "16px", color: "#6B7280" }}>
          Data visualization for <strong>{activeVirus}</strong> goes here.
        </div>
      </ContentContainer>


    </DataPageLayout>

  )};


export default CaseDataPage;
