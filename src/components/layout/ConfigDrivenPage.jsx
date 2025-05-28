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
import { getGroupOptions } from "../../utils/getGroupOptions";
import StatGrid from "../grids/StatGrid";
import OverviewGrid from "../grids/OverviewGrid";
import ToggleControls from "../controls/ToggleControls";
import GroupDropdown from "../controls/GroupDropdown";
import TrendSubtitle from "../controls/TrendSubtitle";

const customComponents = {
  StatGrid,
  OverviewGrid,
};

const viewDisplayLabels = {
  visits: "Visits",
  admits: "Admissions",
};

const groupDisplayNames = {
  Bronx: "the Bronx",
  "0-4": "Ages 0–4",
  "5-17": "Ages 5–17",
  "18-64": "Ages 18–64",
  "65+": "Ages 65+",
  "All Ages": "all Age Groups",
  "All Boroughs": "All Boroughs",
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
  const [groupSelections, setGroupSelections] = useState({});

  const updateGroup = (key, val) => {
    setGroupSelections((prev) => ({ ...prev, [key]: val }));
  };

  const summaryRef = useRef(null);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    const checkAndObserve = () => {
      const el = summaryRef.current;
      if (!el) {
        requestAnimationFrame(checkAndObserve);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => setShowPill(!entry.isIntersecting),
        { threshold: 0.05 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    };
    const cleanup = checkAndObserve();
    return typeof cleanup === "function" ? cleanup : undefined;
  }, []);

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
          config.showTopControls === false ? null : (
            <TopControls
              controls={controls}
              activeVirus={activeVirus}
              onVirusChange={setVirus}
              view={view}
              onViewChange={setView}
            />
          )
        }
        
      >
        {summary?.markdownPath && (
          <TrendSummaryContainer
            ref={summaryRef}
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

            const groupField = section.chart?.props?.groupField;
            const groupLabel = section.chart?.props?.groupLabel || "All Groups";
            const groupOptions = getGroupOptions(filteredData, groupField, groupLabel);
            const activeGroup = groupSelections[key] ?? groupOptions[0] ?? null;
            
            
            const normalizedGroup = (activeGroup || "").trim();
            const normalizedLabel = (groupLabel || "").trim();
            const groupDisplay = groupDisplayNames[normalizedGroup] || normalizedGroup;

            const groupFilteredData =
              !activeGroup || activeGroup === groupLabel
                ? filteredData
                : filteredData.filter((d) => d[groupField] === activeGroup);

            const trendKey = section.chart?.props?.yField || view;
            const trendObj = section.trendEnabled
              ? getTrendFromTimeSeries(groupFilteredData, trendKey)
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
            const latestWeek = groupFilteredData.at?.(-1)?.week || groupFilteredData.at?.(-1)?.date;
            const groupLabelText =
            normalizedGroup && normalizedGroup !== normalizedLabel
              ? `in ${groupDisplay}`
              : `across ${normalizedLabel.toLowerCase()}`;
            
            const fullVars = {
              ...textVars,
              date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
              trend: trendObj
                ? `<span class="${trendClass}">${trendObj.label} ${trendObj.value}%</span>`
                : "not available",
                group: groupLabelText, 

                         
              trendDirection: trendObj?.direction,
              arrow: trendInfo?.arrow,
              viewLabel: viewDisplayLabels[view],
              directionText: trendInfo?.directionText,
              trendColor: trendInfo?.trendColor,
            };

            const rawSubtitleTemplate = resolveText(section.subtitle); // resolves i18n key to "{group}..." string


            const computedSubtitle = (
              <TrendSubtitle
              template={rawSubtitleTemplate}
              variables={fullVars}
                groupProps={{
                  options: groupOptions,
                  active: activeGroup,
                  onChange: (val) => updateGroup(key, val),
                }}
              />
            );
            

            const ChartComponent = chartRegistry[section.chart?.type];
            if (!ChartComponent) {
              console.warn(`Chart type '${section.chart?.type}' not found`);
              return null;
            }
            const resolvedProps = {
              ...interpolatedProps,
              data: groupFilteredData,
              virus: activeVirus,
              view,
              colorMap: tokens.colorScales?.[activeVirus],
            };
            
            if (
              section.chart?.type?.toLowerCase().includes("line") &&
              !resolvedProps.xField
            ) {
              resolvedProps.xField = "date"; 
            }
            
            

            return (
              <SectionWithChart
                key={key}
                title={resolveText(section.title, fullVars)}
                subtitle={computedSubtitle}
                subtitleVariables={fullVars}
                infoIcon={section.infoIcon}
                downloadIcon={section.downloadIcon}
                onDownloadClick={() => downloadCSV(groupFilteredData, `${section.id}.csv`)}
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
                previewData={groupFilteredData}
              >
<ChartContainer
  title={resolveText(section.title, fullVars)}
  chart={<ChartComponent {...resolvedProps} />}
  {...(section.showSidebarToggle
    ? {
        sidebar: (
          <ToggleControls
            data={filteredData}
            view={view}
            onToggle={setView}
          />
        ),
      }
    : {})}
  footer={section.chart.footer}
/>
              </SectionWithChart>
            );
          })}
      </DataPageLayout>

      {config.showPillToggle !== false && showPill && (
        <FloatingTogglePill
          className={showPill ? "visible" : ""}
          activeVirus={activeVirus}
          view={view}
          viewLabel={viewDisplayLabels[view]}
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
