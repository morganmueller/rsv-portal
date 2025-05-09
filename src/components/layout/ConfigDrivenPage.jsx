import React from "react";
import PropTypes from "prop-types";
import { usePageState } from "../hooks/usePageState";
import DataPageLayout from "./DataPageLayout";
import TopControls from "./TopControls";
import TrendSummaryContainer from "./TrendSummaryContainer";
import SectionWithChart from "./SectionWithChart";
import ChartContainer from "./ChartContainer";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import { getTrendFromTimeSeries } from "../../utils/trendUtils";

const resolveText = (input, variables = {}) => {
  const raw = typeof input === "string" && input.includes(".") ? getText(input) : input;
  if (typeof raw !== "string") return raw;
  return raw.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`);
};

const ConfigDrivenPage = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [], data = {}, controls = {} } = config;
  const { activeVirus, view, handleDownload } = usePageState(data);

  return (
    <DataPageLayout
      title={resolveText(titleKey)}
      subtitle={resolveText(subtitleKey)}
      topControls={<TopControls controls={controls} />}
    >
      {summary && (
        <TrendSummaryContainer
          sectionTitle={resolveText(summary.title)}
          date={summary.lastUpdated}
          trendDirection={summary.showTrendArrow ? "up" : "down"}
          markdownPath={summary.markdownPath}
          showTitle={true}
          animateOnScroll={summary.animateOnScroll !== false}
        />
      )}

      {sections.map((section, idx) => {
        const ChartComponent = chartRegistry[section.chart?.type];
        if (!ChartComponent) {
          console.error(`Chart type '${section.chart?.type}' not found`);
          return null;
        }

        const dataKey = section.chart.props?.dataSourceKey;
        const chartData = data[dataKey] || [];

        const trendKey = view === "admits" ? "admits" : "visits";
        const rawTrend = section.trendEnabled
          ? getTrendFromTimeSeries(chartData, trendKey)
          : null;

        const trend =
          typeof rawTrend === "object" && rawTrend !== null
            ? `${rawTrend.label}${rawTrend.value ? ` ${rawTrend.value}%` : ""}`
            : rawTrend ?? "not available";

        const trendDirection =
          typeof rawTrend === "object" && rawTrend?.direction
            ? rawTrend.direction
            : "neutral";

        const date = chartData.at(-1)?.week ?? "N/A";

        const resolvedProps = {
          ...section.chart.props,
          data: chartData,
          virus: activeVirus,
          view: view,
        };

        const textVars = {
          virus: activeVirus,
          view: view,
          trend: trend,
          trendDirection: trendDirection,
          date: date,
        };

        return (
          <SectionWithChart
            key={section.id || idx}
            title={resolveText(section.title, textVars)}
            subtitle={section.subtitle} 
            subtitleVariables={textVars} 
            infoIcon={section.infoIcon}
            downloadIcon={section.downloadIcon}
            onDownloadClick={handleDownload}
            modalTitle={resolveText(section.modal?.title, textVars)}
            modalContent={
              section.modal?.markdownPath && (
                <MarkdownRenderer
                  filePath={section.modal.markdownPath}
                  showTitle={false}
                  sectionTitle={resolveText(section.modal.title || "", textVars)}
                  variables={textVars}

                />
              )
            }
            animateOnScroll={section.animateOnScroll !== false}
          >
            <ChartContainer
              title={resolveText(section.title, textVars)}
              chart={<ChartComponent {...resolvedProps} />}
              footer={section.chart.footer}
            />
          </SectionWithChart>
        );
      })}
    </DataPageLayout>
  );
};

ConfigDrivenPage.propTypes = {
  config: PropTypes.object.isRequired,
};

export default ConfigDrivenPage;
