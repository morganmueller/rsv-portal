import React, { useState, useMemo } from "react";
import DataPageLayout from "../../components/layout/DataPageLayout";
import OverviewGrid from "../../components/grids/OverviewGrid";
import ChartContainer from "../../components/layout/ChartContainer";
import ToggleControls from "../../components/controls/ToggleControls";
import ExampleChart from "../../components/charts/ExampleChart";
import ContentContainer from "../../components/layout/ContentContainer";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import overviewConfig from "../config/OverviewPage.config";
import { getText } from "../../utils/contentUtils";
import { downloadCSV } from "../../utils/downloadUtils";
import { getTrendFromTimeSeries, formatDate } from "../../utils/trendUtils";
import TrendSubtitle from "../controls/TrendSubtitle"; // already in the project

const OverviewPageLayout = () => {
  const [view, setView] = useState("visits");

  // Find the combined-virus section from config
  const chartSection = overviewConfig.sections.find(
    (section) => section.id === "combined-virus"
  );

  // Pull chart data from the hydrated config
  const chartData = overviewConfig.data[chartSection.chart.props.dataSourceKey];

  // Use ARI series for date/trend (matches how your other pages do it)
  const seriesKey = view === "visits" ? "Respiratory illness visits" : "Respiratory illness hospitalizations";
  const ariSeries = Array.isArray(chartData)
    ? chartData
    : chartData?.[seriesKey] || [];

  // Trend from last two points of ARI series
  const trend = useMemo(
    () => getTrendFromTimeSeries(ariSeries, "value"),
    [ariSeries]
  );

  // Latest week label
  const last = ariSeries?.at?.(-1) || {};
  const latestISO = last.week || last.date || null;
  const dateText = latestISO ? formatDate(latestISO) : "N/A";

  // Labels/substitution vars for title/subtitle
  const viewLabel = view === "visits" ? "Visits" : "Hospitalizations";
  // NOTE: your JSON copy expects "to/from" (not "of/from")
  const viewLabelPreposition = view === "visits" ? "to" : "from";

  // Build human trend text (use value if present, otherwise just the label)
  const trendText = trend
    ? trend.value
      ? `${trend.label} ${trend.value}`
      : trend.label
    : "not changed";

  // Get the raw subtitle template string from text.json
  const subtitleTemplate = getText(chartSection.subtitle) || "";

  const handleDownload = () => {
    const filtered = (Array.isArray(chartData) ? chartData : Object.values(chartData).flat()).map(
      ({ week, date, [view]: v, value }) => ({
        week: week || date, // support either field name
        [view]: v ?? value,
      })
    );
    const prefix = overviewConfig.id || "overview";
    downloadCSV(filtered, `${prefix}-${view}-trend.csv`);
  };

  return (
    <DataPageLayout
      title={getText(overviewConfig.titleKey)}
      subtitle={getText(overviewConfig.subtitleKey)}
      subtitleVariables={{
        date: dateText,
        trend: trendText,
        trendDirection: trend?.direction || "neutral",
        viewLabel,
        viewLabelPreposition,
      }}
    >
      {/* Section 1: Stat cards (optional) */}
      <ContentContainer
        title={getText("overview.indicators.title")}
        animateOnScroll
        background="white"
      >
        {/* <StatGrid /> */}
      </ContentContainer>

      {/* Section 2: Combined-virus chart with subtitle ABOVE the chart */}
      <ContentContainer
        title={getText(chartSection.title)}
        titleVariables={{ viewLabel, viewLabelPreposition }}
        subtitle={
          <TrendSubtitle
            as="div" 
            template={subtitleTemplate}
            variables={{
              // let TrendSubtitle / CSS add the chips
              date: dateText,
              viewLabel,
              viewLabelPreposition,
              trend: trendText,
              trendDirection: trend?.direction || "neutral",
            }}
          />
        } 
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
          sidebar={
            <ToggleControls
              data={
                Array.isArray(chartData)
                  ? chartData
                  : Object.values(chartData).flat()
              }
              view={view}
              onToggle={setView}
            />
          }
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
