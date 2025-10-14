// src/pages/DataExplorerPage.jsx
import React from "react";
import { usePageState } from "../../components/hooks/usePageState";
import DataPageLayout from "../../components/layout/DataPageLayout";
import TopControls from "../../components/layout/TopControls";
import TrendSummaryContainer from "../../components/layout/TrendSummaryContainer";
import SectionWithChart from "../../components/layout/SectionWithChart";
import ChartContainer from "../../components/layout/ChartContainer";
import ContentContainer from "../../components/layout/ContentContainer";
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
  const { titleKey, subtitleKey, summary, sections = [], data = {}, controls = {} } = config;

  // Pull dataType from state (fallback to 'ed' if not present)
  const { activeVirus, view, dataType = "ed", handleDownload } = usePageState(data);
  const effectiveDataType = config.id === "caseDataPage" ? "lab" : dataType;

  const titleVars = {
    virus: activeVirus,
    virusLowercase: (activeVirus || "").toLowerCase?.() || activeVirus,
    view,
    viewLabel: viewDisplayLabels[view],
    viewLabelPreposition: viewDisplayLabelsPreposition[view],
  };

  // Only render sections that either don't declare a dataType
  // OR explicitly match the current page dataType
 const filteredSections = sections
   .filter((s) => !s.dataType || s.dataType === effectiveDataType)
   .filter((s) =>
     !s.showIfVirus
       ? true
       : Array.isArray(s.showIfVirus)
       ? s.showIfVirus.includes(activeVirus)
       : s.showIfVirus === activeVirus
   );

  return (
    <DataPageLayout
      title={getText(titleKey)}
      subtitle={getText(subtitleKey)}
      topControls={<TopControls controls={controls} />}
    >
      {summary && (
        <TrendSummaryContainer
          sectionTitle={summary.title}
          date={summary.lastUpdated}
          trendDirection={summary.showTrendArrow ? "up" : "down"}
          markdownPath={summary.markdownPath}
          showTitle={summary.showSecondaryTitle} 
          metricLabel={summary.metricLabel}
        />
      )}

      {filteredSections.map((section, idx) => {
        // --- Render "custom" sections (e.g., ED R&E info card) ---
        if (section.renderAs === "custom") {
          const customTitle = resolveTokens(section.title || "", titleVars);
          const bodyHtml = section.textKey ? getText(section.textKey) : "";
          return (
            <ContentContainer
              key={section.id || `custom-${idx}`}
              title={customTitle}
              infoIcon={section.infoIcon}
              downloadIcon={section.downloadIcon}
              animateOnScroll={section.animateOnScroll}
            >
              <div
                className="markdown-body"
                // text.json strings may contain basic HTML; render safely as trusted CMS copy
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </ContentContainer>
          );
        }

        // --- Guard: chart block must exist ---
        if (!section.chart || !section.chart.type) {
          console.warn(
            `[DataExplorer] Section '${section.id || idx}' has no chart.type and is not custom. Skipping.`
          );
          return null;
        }

        const ChartComponent = chartRegistry[section.chart.type];
        if (!ChartComponent) {
          console.error(`Chart type '${section.chart.type}' not found in chartRegistry`);
          return (
            <div key={`missing-${idx}`} style={{ color: "#B91C1C", padding: "1rem" }}>
              ⚠️ Chart component for <code>{section.chart.type}</code> not found.
            </div>
          );
        }

        // --- Data plumbing for charts ---
        const dataKey = section.chart.props?.dataSourceKey;
        const slice = (dataKey && data[dataKey]) || [];
        const flattened = flattenSlice(slice);

        const subtitleNode = renderSectionSubtitle({
          section,
          dataSlice: flattened,
          context: { activeVirus, view },
        });

        const resolvedProps = {
          ...section.chart.props,
          data: flattened,
          virus: activeVirus,
          view,
        };

        const sectionTitle = resolveTokens(section.title || "", titleVars);

        return (
          <SectionWithChart
            key={section.id || idx}
            title={sectionTitle}
            subtitle={subtitleNode}
            subtitleVariables={{}}
            titleVariables={titleVars}
            infoIcon={section.infoIcon}
            downloadIcon={section.downloadIcon}
            onDownloadClick={handleDownload}
            modalTitle={resolveTokens(section.modal?.title || "", titleVars)}
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
            <ChartContainer
              title={sectionTitle}
              chart={<ChartComponent {...resolvedProps} />}
              footer={section.chart.footer}
            />
          </SectionWithChart>
        );
      })}
    </DataPageLayout>
  );
};

export default DataExplorerPage;
