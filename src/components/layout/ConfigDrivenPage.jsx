import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { usePageState } from "../hooks/usePageState";
import DataPageLayout from "./DataPageLayout";
import TopControls from "./TopControls";
import TrendSummaryContainer from "./TrendSummaryContainer";
import SectionWithChart from "./SectionWithChart";
import ChartContainer from "./ChartContainer";
import ContentContainer from "./ContentContainer";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import MarkdownCardSection from "../cards/MarkdownCardSection";
import MarkdownParagraphSection from "../contentUtils/MarkdownParagraphSection";
import { tokens } from "../../styles/tokens"; // adjust path as needed
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import {
  getTrendFromTimeSeries,
  generateTrendSubtitle,
  formatDate,
} from "../../utils/trendUtils";

import StatGrid from "../grids/StatGrid";
import OverviewGrid from "../grids/OverviewGrid";
import ToggleControls from "../controls/ToggleControls";

const customComponents = {
  StatGrid,
  OverviewGrid,
};

const viewColorMap = {
  visits: tokens.colors.bluePrimary,
  admits: tokens.colors.rose600,
};

const resolveText = (input, variables = {}) => {
  const raw =
    typeof input === "string" && input.includes(".") ? getText(input) : input;
  return typeof raw === "string"
    ? raw.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`)
    : raw;
};

// Interpolates strings like "{view}" => "visits"
const interpolateTokens = (value, vars) => {
  if (typeof value === "string") {
    return value.replace(/{(\w+)}/g, (_, key) => vars[key] ?? `{${key}}`);
  }
  return value;
};



// Recursively interpolates all string values in an object
const interpolateObject = (obj, vars) =>
  JSON.parse(JSON.stringify(obj), (_, value) => interpolateTokens(value, vars));

const ConfigDrivenPage = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [], data = {}, controls = {} } = config;

  const useStateNeeded =
    controls?.virusToggle || controls?.viewToggle || config?.type === "data";

  const pageState = useStateNeeded ? usePageState(data, controls) : {};
  const {
    activeVirus = "COVID-19",
    view = "visits",
    handleDownload = () => {},
    setView = () => {},
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
      topControls={
        config.showTopControls === false ? null :
        (useStateNeeded ? <TopControls controls={controls} /> : null)
      }
      >
      {summary?.markdownPath && (
        <TrendSummaryContainer
          sectionTitle={resolveText(summary.titleKey || summary.title)}
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
        };

        const interpolatedProps = interpolateObject(section.chart?.props || {}, textVars);
        const rawData = data[interpolatedProps.dataSourceKey] || [];

        const filteredData = rawData.filter(
          (d) => !d.virus || d.virus === activeVirus
        );

        const trendKey = view === "admits" ? "admits" : "visits";
        const trendObj = section.trendEnabled
          ? getTrendFromTimeSeries(filteredData, trendKey)
          : null;

        const trend =
          trendObj && typeof trendObj === "object"
            ? `${trendObj.label}${trendObj.value ? ` ${trendObj.value}%` : ""}`
            : trendObj ?? "not available";

        const trendDirection = trendObj?.direction;

        const fullVars = {
          ...textVars,
          date: formatDate(filteredData.at?.(-1)?.week),
          trend,
          trendDirection,
          viewColor: viewColorMap[view]
        };

        // Skip hidden or overview-only blocks
        if (section.renderAs === "overview" || section.renderAs === "hidden") return null;

        if (section.renderAs === "custom") {
          const CustomComponent = customComponents[section.component];
          return CustomComponent ? (
            <ContentContainer
              key={key}
              title={resolveText(section.titleKey)}
              subtitle={resolveText(section.subtitle, textVars)}
              subtitleVariables={textVars}
              animateOnScroll={section.animateOnScroll !== false}
              background={section.background || "white"}
            >
              <CustomComponent />
            </ContentContainer>
          ) : null;
        }

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

        const ChartComponent = chartRegistry[section.chart?.type];
        if (!ChartComponent) {
          console.warn(`Chart type '${section.chart?.type}' not found`);
          return null;
        }

        const resolvedProps = {
          ...interpolatedProps,
          data: filteredData,
          virus: activeVirus,
          view,
        };

        const computedSubtitle = section.subtitle
          ? resolveText(section.subtitle, fullVars)
          : generateTrendSubtitle({
              view,
              trendObj,
              latestWeek: filteredData.at?.(-1)?.week,
            });

        return (
          <SectionWithChart
            key={key}
            title={resolveText(section.title, fullVars)}
            subtitle={computedSubtitle}
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
              sidebar={
                section.showSidebarToggle ? (
                  <ToggleControls
                    data={filteredData}
                    view={view}
                    onToggle={setView}
                  />
                ) : null
              }
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
