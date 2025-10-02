// src/pages/DataExplorerPage.jsx
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

// CENTRALIZED subtitle helpers
import {
  renderSectionSubtitle,
  flattenSlice,
  viewDisplayLabels,
  viewDisplayLabelsPreposition,
} from "../../utils/subtitleEngine";

const resolveTokens = (input, vars = {}) => {
  if (typeof input !== "string") return input;
  const raw = input.includes(".") ? getText(input) : input;
  return raw.replace(/{(\w+)}/g, (_, k) => (vars[k] ?? ""));
};

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
          trendDirection={summary.showTrendArrow ? "up" : "down"}
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
        const slice = data[dataKey] || [];
        const flattened = flattenSlice(slice);

        const subtitleNode = renderSectionSubtitle({
          section,
          dataSlice: flattened,
          context: { activeVirus, view },
          // DataExplorer generally doesn’t have group controls; omit `group`
        });

        const titleVars = {
          virus: activeVirus,
          viewLabel: viewDisplayLabels[view],
          viewLabelPreposition: viewDisplayLabelsPreposition[view],
        };

        const resolvedProps = {
          ...section.chart.props,
          data: flattened,
          virus: activeVirus,
          view,
        };

        return (
          <SectionWithChart
            key={section.id || idx}
            title={resolveTokens(section.title || "", titleVars)}
            subtitle={subtitleNode}
            subtitleVariables={{}}
            titleVariables={titleVars}
            infoIcon={section.infoIcon}
            downloadIcon={section.downloadIcon}
            onDownloadClick={handleDownload}
            modalTitle={section.modal?.title}
            modalContent={
              section.modal?.markdownPath ? (
                <MarkdownRenderer
                  filePath={section.modal.markdownPath}
                  sectionTitle={resolveTokens(section.modal.title || "", titleVars)}
                  showTitle={true}
                  variables={{ ...titleVars }}
                />
              ) : null
            }
          >
            {ChartComponent ? (
              <ChartContainer
                title={resolveTokens(section.title || "", titleVars)}
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
