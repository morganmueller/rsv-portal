import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { usePageState } from "../hooks/usePageState";
import DataPageLayout from "./DataPageLayout";
import TopControls from "./TopControls";
import TrendSummaryContainer from "./TrendSummaryContainer";
import SectionWithChart from "./SectionWithChart";
import ChartContainer from "./ChartContainer";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import MarkdownCardSection from "../cards/MarkdownCardSection";
import MarkdownParagraphSection from "../contentUtils/MarkdownParagraphSection";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import { getTrendFromTimeSeries } from "../../utils/trendUtils";

const resolveText = (input, variables = {}) => {
  const raw = typeof input === "string" && input.includes(".") ? getText(input) : input;
  return typeof raw === "string"
    ? raw.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`)
    : raw;
};

const ConfigDrivenPage = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [], data = {}, controls = {} } = config;

  const useStateNeeded =
    controls?.virusToggle || controls?.viewToggle || config?.type === "data";

  const pageState = useStateNeeded ? usePageState(data) : {};
  const {
    activeVirus = "COVID-19",
    view = "visits",
    handleDownload = () => {},
  } = pageState;

  const [markdownContent, setMarkdownContent] = useState("");

  useEffect(() => {
    if (summary?.markdownPath) {
      fetch(summary.markdownPath)
        .then((res) => res.text())
        .then(setMarkdownContent)
        .catch((err) => console.error("Failed to load markdown:", err));
    }
  }, [summary?.markdownPath]);

  return (
    <DataPageLayout
      title={resolveText(titleKey)}
      subtitle={resolveText(subtitleKey)}
      topControls={useStateNeeded ? <TopControls controls={controls} /> : null}
    >
      {summary?.markdownPath && (
        <TrendSummaryContainer
          sectionTitle={resolveText(summary.titleKey)}
          date={summary.lastUpdated}
          markdownPath={summary.markdownPath}
          showTitle
          animateOnScroll={summary.animateOnScroll !== false}
          virus={activeVirus}
          view={view}
          {...(summary.showTrendArrow ? { trendDirection: "up" } : {})}
        />
      )}

      {sections.map((section, idx) => {
        const key = section.id || idx;
        const textVars = {
          virus: activeVirus,
          view,
          date: data?.[section.chart?.props?.dataSourceKey]?.at?.(-1)?.week ?? "N/A",
        };

        if (section.renderAs === "overview" || section.renderAs === "hidden") return null;

        if (section.renderAs === "cards") {
          return (
            <MarkdownCardSection
              key={key}
              title={resolveText(section.titleKey)}
              markdown={markdownContent}
              sectionTitle={section.markdownSection}
              cards={section.cards.map((card) => ({
                ...card,
                title: resolveText(card.titleKey),
              }))}
            />
          );
        }

        if (section.renderAs === "paragraph") {
          return (
            <MarkdownParagraphSection
              key={key}
              title={resolveText(section.titleKey)}
              markdown={markdownContent}
              sectionTitle={section.markdownSection}
            />
          );
        }

        // Chart-driven fallback
        const ChartComponent = chartRegistry[section.chart?.type];
        if (!ChartComponent) {
          console.warn(`Chart type '${section.chart?.type}' not found`);
          return null;
        }

        const chartData = data[section.chart.props?.dataSourceKey] || [];
        const trendKey = view === "admits" ? "admits" : "visits";
        const trendObj = section.trendEnabled
          ? getTrendFromTimeSeries(chartData, trendKey)
          : null;

        const trend =
          trendObj && typeof trendObj === "object"
            ? `${trendObj.label}${trendObj.value ? ` ${trendObj.value}%` : ""}`
            : trendObj ?? "not available";

        const trendDirection = trendObj?.direction;
        const fullVars = { ...textVars, trend, trendDirection };

        const resolvedProps = {
          ...section.chart.props,
          data: chartData,
          virus: activeVirus,
          view,
        };

        return (
          <SectionWithChart
            key={key}
            title={resolveText(section.title, fullVars)}
            subtitle={resolveText(section.subtitle, fullVars)}
            subtitleVariables={fullVars}
            infoIcon={section.infoIcon}
            downloadIcon={section.downloadIcon}
            onDownloadClick={handleDownload}
            modalTitle={resolveText(section.modal?.title, fullVars)}
            modalContent={
              section.modal?.markdownPath && (
                <MarkdownRenderer
                  filePath={section.modal.markdownPath}
                  sectionTitle={resolveText(section.modal.title || "", fullVars)}
                  showTitle={false}
                  variables={fullVars}
                />
              )
            }
            animateOnScroll={section.animateOnScroll !== false}
          >
            <ChartContainer
              title={resolveText(section.title, fullVars)}
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
