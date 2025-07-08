import React, { useState, useMemo } from "react";
import DataPageLayout from "../../components/layout/DataPageLayout";
import StatGrid from "../../components/grids/StatGrid";
import OverviewGrid from "../../components/grids/OverviewGrid";
import ChartContainer from "../../components/layout/ChartContainer";
import ToggleControls from "../../components/controls/ToggleControls";
import ExampleChart from "../../components/charts/ExampleChart";
import ContentContainer from "../../components/layout/ContentContainer";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import overviewConfig from "../config/OverviewPage.config";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";
import { getTrendFromTimeSeries } from "../../utils/trendUtils";

const OverviewPageLayout = () => {
  const [view, setView] = useState("visits");
  const chartSection = overviewConfig.sections.find(section => section.id === "monthly-ari-overview");
  const chartData = overviewConfig.data[chartSection.chart.props.dataSourceKey];

  const trend = useMemo(() => getTrendFromTimeSeries(chartData, view), [chartData, view]);

  const subtitleText = trend ? (
    <>
      {view === "visits" ? "Visits" : "Hospitalizations"} have{" "}
      <span className={`trend-text trend-${trend.direction}`}>
        {trend.label}
        {trend.value ? ` ${trend.value}%` : ""}
      </span>{" "}
      since last week.
    </>
  ) : null;

  const handleDownload = () => {
    const filtered = chartData.map(({ week, [view]: value }) => ({
      week,
      [view]: value,
    }));
    const prefix = overviewConfig.id || "overview";
    downloadCSV(filtered, `${prefix}-${view}-trend.csv`);
  };

  return (
    <DataPageLayout
      title={getText(overviewConfig.titleKey)}
      subtitle={getText(overviewConfig.subtitleKey)}
    >
      {/* Section 1: Stat cards */}
      <ContentContainer
        title={getText("overview.indicators.title")}
        animateOnScroll
        background="white"

      >
        {/* <StatGrid /> */}
      </ContentContainer>

      {/* Section 2: Chart container driven by config */}
      <ContentContainer
      
        title={getText(chartSection.title)}
        subtitle={subtitleText}
        infoIcon={chartSection.infoIcon}
        downloadIcon={chartSection.downloadIcon}
        onDownloadClick={handleDownload}
        modalTitle={chartSection.modal?.title}
        modalContent={
          chartSection.modal?.markdownPath && (
            <MarkdownRenderer
              filePath={chartSection.modal.markdownPath}
              sectionTitle={chartSection.modal.title}
              showTitle={true}
            />
          )
        }
        animateOnScroll={chartSection.animateOnScroll !== false}
      >
        <ChartContainer
          sidebar={<ToggleControls data={chartData} onToggle={setView} />}
          chart={<ExampleChart data={chartData} view={view} />}
          footer={chartSection.chart.footer}
        />
      </ContentContainer>

      {/* Section 3: Overview info grid */}
      <OverviewGrid />
    </DataPageLayout>
  );
};

export default OverviewPageLayout;
