import React, { useState, useMemo } from "react";
import OverviewSection from "./OverviewSection";
import StatGrid from "../../components/grids/StatGrid";
import OverviewGrid from "../../components/grids/OverviewGrid";
import ChartContainer from "../../components/layout/ChartContainer";
import ExampleChart from "../../components/charts/ExampleChart";
import ToggleControls from "../../components/controls/ToggleControls";
import ContentContainer from "../../components/layout/ContentContainer";
import DataPageLayout from "../../components/layout/DataPageLayout";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";
import { getTrendFromTimeSeries } from "../../utils/trendUtils";

import "./OverviewPage.css"
// Dummy data for testing trend computation
const chartData = [
  { week: "2025-01-01", visits: 12456, admits: 4800 },
  { week: "2025-01-08", visits: 11789, admits: 4400 },
  { week: "2025-01-15", visits: 13210, admits: 5100 },
  { week: "2025-01-22", visits: 14032, admits: 5800 },
  { week: "2025-01-29", visits: 19044, admits: 6100 },
  { week: "2025-02-05", visits: 19500, admits: 5900 } // <- latest week
];

const OverviewPage = () => {
  const [view, setView] = useState("visits");

  const trend = useMemo(() => getTrendFromTimeSeries(chartData, view), [chartData, view]);

  const subtitleText = trend ? (
    <>
      {view === "visits" ? "Visits" : "Admits"} have{" "}
      <span className={`trend-text trend-${trend.direction}`}>
        {trend.label}
        {trend.value ? ` ${trend.value}%` : ""}
      </span>{" "}
      since last week.
    </>
  ) : "";
  

  const handleDownload = () => {
    const filtered = chartData.map(({ week, [view]: value }) => ({
      week,
      [view]: value,
    }));
    downloadCSV(filtered, `ari-${view}-trend.csv`);
  };

  return (
    <DataPageLayout
      title={getText("overview.title")}
      subtitle={getText("overview.subtitle")}
      // info={<OverviewSection />}
    >
      <ContentContainer 
        title={getText("overview.indicators.title")}
        animateOnScroll={true}
      >
        <StatGrid />
      </ContentContainer>

      <ContentContainer
        title={getText("overview.charts.monthlyARIChart.title")}
        subtitle={subtitleText}
        animateOnScroll={true}
        infoIcon={true}
        downloadIcon={true}
        onDownloadClick={handleDownload}
        modalTitle="About These Metrics"
        modalContent={
          <MarkdownRenderer 
            filePath="../../content/modals/metric-explainer.md"
            showTitle={true}
            sectionTitle="ARI Visits"
          />
        }
      >
        <ChartContainer
          sidebar={<ToggleControls data={chartData} onToggle={setView} />}
          chart={<ExampleChart data={chartData} view={view} />}
          footer="Source: NYC Health Department Syndromic Surveillance"
        />
      </ContentContainer>

      <OverviewGrid />
    </DataPageLayout>
  );
};

export default OverviewPage;
