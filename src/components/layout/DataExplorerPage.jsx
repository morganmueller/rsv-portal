import React from "react";
import { usePageState } from "../../components/hooks/usePageState";
import DataPageLayout from "../../components/layout/DataPageLayout";
import TopControls from "../../components/layout/TopControls";
import TrendSummaryContainer from "../../components/layout/TrendSummaryContainer";
import SectionWithChart from "../../components/layout/SectionWithChart";
import ChartContainer from "../../components/layout/ChartContainer";
import MarkdownRenderer from "../../components/contentUtils/MarkdownRenderer";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";

import config from "../../pages/config/EmergencyDeptPage.config"; // ✅ adjust path as needed

const DataExplorerPage = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [], data = {} } = config;
  const { activeVirus, view, handleDownload } = usePageState(data);

  return (
    <DataPageLayout
      title={getText(titleKey)}
      subtitle={getText(subtitleKey)}
      topControls={<TopControls controls={config.controls} />}
    >
      {summary && (
        <TrendSummaryContainer
        sectionTitle={summary.title}
        date={summary.lastUpdated}
        trendDirection={summary.showTrendArrow ? "up" : "down"} // or compute real trend later
        markdownPath={summary.markdownPath}
        showTitle={summary.showSecondayTitle}
        metricLabel={summary.metricLabel} 

      />
      
      )}

      {sections.map((section, idx) => {
        const ChartComponent = chartRegistry[section.chart.type];
        if (!ChartComponent) {
          console.error(`Chart type '${section.chart.type}' not found in chartRegistry`);
          return null;
        }

        const dataKey = section.chart.props?.dataSourceKey;
        const chartData = data[dataKey] || [];

        const resolvedProps = {
          ...section.chart.props,
          data: chartData,
          virus: activeVirus,
          view: view,
        };

        return (
          <SectionWithChart
            key={section.id || idx}
            title={section.title?.replace("{virus}", activeVirus)}
            subtitle={section.subtitle}
            subtitleVariables={{ virus: activeVirus, trend: "higher" }}
            infoIcon={section.infoIcon}
            downloadIcon={section.downloadIcon}
            onDownloadClick={handleDownload}
            modalTitle={section.modal?.title}
            modalContent={
              section.modal?.markdownPath ? (
            <MarkdownRenderer
              filePath={section.modal.markdownPath}
              sectionTitle={resolveText(section.modal.title, { ...textVars, trend: view })}
              showTitle={true}
            />

              ) : null
            }            
          >
            {ChartComponent ? (
              <ChartContainer
              title={section.title?.replace("{virus}", activeVirus)}
              chart={<ChartComponent {...resolvedProps} />}
                footer={section.chart.footer}
              />
            ) : (
              <div style={{ color: "#B91C1C", padding: "1rem" }}>
                ⚠️ Chart component for <code>{section.chart.type}</code> not found.
              </div>
            )}
          </SectionWithChart>
        );
        
      })}
    </DataPageLayout>
    
  );
  
};

export default DataExplorerPage;
