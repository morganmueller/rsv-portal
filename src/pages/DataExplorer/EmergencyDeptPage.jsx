import React, { useState, useMemo } from "react";
import DataPageLayout from "../../components/layout/DataPageLayout";
import VirusFilterGroup from "../../components/controls/VirusFilterGroup";
import ViewToggleGroup from "../../components/controls/VisitAdmitToggle";
import ContentContainer from "../../components/layout/ContentContainer";
import DataSummarySection from "../../components/sections/DataSummarySection";
import SeasonalEDChart from "../../components/charts/edSeasonalComparisonChart";
import MarkdownRenderer from "../../../src/components/contentUtils/MarkdownRenderer";
import ChartContainer from "../../components/layout/ChartContainer";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";

const chartData = [
  { week: "1", season: "2021-22", visits: 3400 },
  { week: "1", season: "2022-23", visits: 4000 },
  { week: "1", season: "2023-24", visits: 4200 },
  { week: "1", season: "2024-25", visits: 4600 },
  { week: "2", season: "2021-22", visits: 3900 },
  { week: "2", season: "2022-23", visits: 4400 },
  { week: "2", season: "2023-24", visits: 4700 },
  { week: "2", season: "2024-25", visits: 5100 },
  { week: "3", season: "2021-22", visits: 3700 },
  { week: "3", season: "2022-23", visits: 4100 },
  { week: "3", season: "2023-24", visits: 4300 },
  { week: "3", season: "2024-25", visits: 4700 },
  { week: "4", season: "2021-22", visits: 3600 },
  { week: "4", season: "2022-23", visits: 4050 },
  { week: "4", season: "2023-24", visits: 4500 },
  { week: "4", season: "2024-25", visits: 4800 },
  { week: "5", season: "2021-22", visits: 3500 },
  { week: "5", season: "2022-23", visits: 4200 },
  { week: "5", season: "2023-24", visits: 4600 },
  { week: "5", season: "2024-25", visits: 5000 },
  { week: "6", season: "2021-22", visits: 3650 },
  { week: "6", season: "2022-23", visits: 4300 },
  { week: "6", season: "2023-24", visits: 4700 },
  { week: "6", season: "2024-25", visits: 5100 },
  { week: "7", season: "2021-22", visits: 3750 },
  { week: "7", season: "2022-23", visits: 4400 },
  { week: "7", season: "2023-24", visits: 4800 },
  { week: "7", season: "2024-25", visits: 5200 },
  { week: "8", season: "2021-22", visits: 3800 },
  { week: "8", season: "2022-23", visits: 4500 },
  { week: "8", season: "2023-24", visits: 4900 },
  { week: "8", season: "2024-25", visits: 5300 }
];

const EmergencyDeptPage = () => {
  const [activeVirus, setActiveVirus] = useState("COVID-19");
  const [view, setView] = useState("visits");

  const handleVirusChange = (virus) => setActiveVirus(virus);

  const isHigher = useMemo(() => {
    const current = chartData.filter(d => d.season === "2024-25").at(-1)?.visits || 0;
    const previous = chartData.filter(d => d.season === "2023-24").at(-1)?.visits || 0;
    return current > previous;
  }, [chartData]);

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
      title={getText("emergencyDeptPage.mainTitle")}
      subtitle={getText("emergencyDeptPage.mainSubtitle")}
      topControls={
        <>
          <VirusFilterGroup onChange={handleVirusChange} />
          <ViewToggleGroup activeView={view} onChange={setView} />
        </>
      }
    >
      {/* Summary */}
      <ContentContainer title={getText("emergencyDeptPage.summarySection.summaryTitle")}>
        <DataSummarySection
          virus={activeVirus}
          view={view}
          trendDirection={isHigher ? "up" : "down"}
          lastDate="05/01/2025"
          markdownPath="../../content/sections/edSectionText.md"
          showTitle={false}
          sectionTitle="Page Overview"
        />
      </ContentContainer>

      {/* Main Trends */}
      <ContentContainer
        title={`${activeVirus} Emergency Department Trends`}
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

      {/* Seasonal Chart Section */}
      <ContentContainer
        title="Seasonal Emergency Department Visits by Week Compared to Previous Three Seasons"
        subtitle="Emergency department visits for {virus} are {trend} this week than last week."
        subtitleVariables={{
          virus: activeVirus,
          trend: isHigher ? "higher" : "lower",
        }}
        animateOnScroll
        infoIcon
        downloadIcon
        onDownloadClick={handleDownload} // ← This triggers the modal and download
        modalTitle="About These Metrics"
        modalContent={
          <MarkdownRenderer
            filePath="../../content/modals/metric-explainer.md"
            showTitle
            sectionTitle="Seasonal ED Visits"
          />
        }
      >
        <ChartContainer
          title={`${activeVirus} Seasonal Comparison`}
          chart={<SeasonalEDChart data={chartData} view={view} virus={activeVirus} />}
          footer="Source: NYC Health Department Syndromic Surveillance"
        />
      </ContentContainer>


    </DataPageLayout>
  );
};

export default EmergencyDeptPage;
