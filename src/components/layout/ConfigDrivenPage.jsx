import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { usePageState } from "../hooks/usePageState";
import DataPageLayout from "./DataPageLayout";
import TopControls from "./TopControls";
import TrendSummaryContainer from "./TrendSummaryContainer";
import SectionWithChart from "./SectionWithChart";
import ChartContainer from "./ChartContainer";
import ContentContainer from "./ContentContainer";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import { downloadCSV } from "../../utils/downloadUtils";
import FloatingTogglePill from "../controls/FloatingTogglePill";
import MarkdownParagraphSection from "../contentUtils/MarkdownParagraphSection";
import { tokens } from "../../styles/tokens";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import {
  getTrendFromTimeSeries,
  generateTrendSubtitle,
  formatDate,
  capitalizeFirstHtml,
  getTrendInfo,
} from "../../utils/trendUtils";
import { loadConfigWithData } from "../../utils/loadConfigWithData";

import StatGrid from "../grids/StatGrid";
import OverviewGrid from "../grids/OverviewGrid";
import ToggleControls from "../controls/ToggleControls";

const customComponents = {
  StatGrid,
  OverviewGrid,
};

const viewDisplayLabels = {
  visits: "Visits",
  admits: "Admissions",
};

const resolveText = (input, variables = {}) => {
  const raw = typeof input === "string" && input.includes(".") ? getText(input) : input;
  return typeof raw === "string"
    ? raw.replace(/{(\w+)}/g, (_, key) => variables[key] ?? `{${key}}`)
    : raw;
};

const interpolateTokens = (value, vars) => {
  if (typeof value === "string") {
    return value.replace(/{(\w+)}/g, (_, key) => vars[key] ?? `{${key}}`);
  }
  return value;
};

const interpolateObject = (obj, vars) =>
  JSON.parse(JSON.stringify(obj), (_, value) => interpolateTokens(value, vars));

const ConfigDrivenPage = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [], controls = {} } = config;

  const pageState = usePageState(config.data, controls);
  const {
    activeVirus = "COVID-19",
    view = "visits",
    handleDownload = () => {},
    setView = () => {},
    setVirus = () => {},
  } = pageState;

  const [hydratedConfig, setHydratedConfig] = useState(null);
  const [markdownContent, setMarkdownContent] = useState("");

  const summaryRef = useRef(null);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowPill(!entry.isIntersecting);
      },
      { threshold: 0.05 } // more sensitive to any scroll
    );
  
    const el = summaryRef.current;
    if (el) {
      observer.observe(el);
    }
  
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [summaryRef.current]); // run again if the ref updates
  

  useEffect(() => {
    if (config.data) {
      setHydratedConfig(config);
      return;
    }

    const selectedVirus = activeVirus || config.defaultVirus || "COVID-19";
    const selectedView = view || config.defaultView || "visits";

    loadConfigWithData(config, { virus: selectedVirus, view: selectedView })
      .then(setHydratedConfig)
      .catch(console.error);
  }, [config, activeVirus, view]);

  useEffect(() => {
    if (summary?.markdownPath) {
      fetch(summary.markdownPath)
        .then((res) => res.text())
        .then(setMarkdownContent)
        .catch((err) => console.error("Failed to load markdown:", err));
    }
  }, [summary?.markdownPath]);

  if (!hydratedConfig) return <div>Loading...</div>;
  const { data = {}, sections: hydratedSections = [] } = hydratedConfig;

  return (
    <>
      <DataPageLayout
        title={resolveText(titleKey)}
        subtitle={resolveText(subtitleKey)}
        topControls={
          config.showTopControls === false ? null : <TopControls controls={controls} />
        }
      >
        {summary?.markdownPath && (
          <div ref={summaryRef}>
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
          </div>
        )}

        {hydratedSections
          .filter((section) => {
            const allowed = section.showIfVirus;
            return (
              !allowed ||
              (Array.isArray(allowed) ? allowed.includes(activeVirus) : allowed === activeVirus)
            );
          })
          .map((section, idx) => {
            const key = section.id || idx;

            const textVars = {
              virus: activeVirus,
              view,
              displayView: `<span class="bg-highlight">${viewDisplayLabels[view]}</span>`,
            };

            const interpolatedProps = interpolateObject(section.chart?.props || {}, textVars);
            const dataSourceKey =
              section.dataSourceKey ||
              interpolatedProps.dataSourceKey ||
              section.chart?.props?.dataSourceKey ||
              null;

            const filteredData =
              dataSourceKey && data[dataSourceKey] ? data[dataSourceKey] : [];

            if (section.renderAs === "overview" || section.renderAs === "hidden") return null;

            if (section.renderAs === "custom") {
              const CustomComponent = customComponents[section.component];
              if (!CustomComponent) return null;
              const shouldPassData = CustomComponent.length > 0;
              return (
                <ContentContainer
                  key={key}
                  title={resolveText(section.titleKey)}
                  subtitle={resolveText(section.subtitle, textVars)}
                  subtitleVariables={textVars}
                  animateOnScroll={section.animateOnScroll !== false}
                  background={section.background || "white"}
                >
                  {shouldPassData ? <CustomComponent data={filteredData} /> : <CustomComponent />}
                </ContentContainer>
              );
            }

            const trendKey = section.chart?.props?.yField || view;
            const trendObj = section.trendEnabled
              ? getTrendFromTimeSeries(filteredData, trendKey)
              : null;

            const trendInfo = getTrendInfo({
              trendDirection: trendObj?.direction,
              metricLabel: viewDisplayLabels[view],
              virus: activeVirus,
            });

            const trendClass =
              trendObj?.direction === "up"
                ? "trend-up"
                : trendObj?.direction === "down"
                ? "trend-down"
                : "trend-neutral";

            const latestWeek = filteredData.at?.(-1)?.week || filteredData.at?.(-1)?.date;

            const fullVars = {
              ...textVars,
              date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
              trend: trendObj
                ? `<span class="${trendClass}">${trendObj.label} ${trendObj.value}%</span>`
                : "not available",
              trendDirection: trendObj?.direction,
              arrow: trendInfo?.arrow,
              viewLabel: viewDisplayLabels[view],
              directionText: trendInfo?.directionText,
              trendColor: trendInfo?.trendColor,
            };

            const rawSubtitle = section.subtitle
              ? resolveText(section.subtitle, fullVars)
              : generateTrendSubtitle({ view, trendObj, latestWeek });

            const computedSubtitle = capitalizeFirstHtml(rawSubtitle);

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
              colorMap: tokens.colorScales?.[activeVirus],
            };

            return (
              <SectionWithChart
                key={key}
                title={resolveText(section.title, fullVars)}
                subtitle={computedSubtitle}
                subtitleVariables={fullVars}
                infoIcon={section.infoIcon}
                downloadIcon={section.downloadIcon}
                onDownloadClick={() => downloadCSV(filteredData, `${section.id}.csv`)}
                columnLabels={interpolatedProps.columnLabels}
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
                previewData={filteredData}

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

      {config.showPillToggle !== false && showPill && (
        <FloatingTogglePill
          activeVirus={activeVirus}
          view={view}
          onVirusChange={setVirus}
          onViewChange={setView}
          controls={controls}
        />
      )}
    </>
  );
};

ConfigDrivenPage.propTypes = {
  config: PropTypes.object.isRequired,
};

export default ConfigDrivenPage;