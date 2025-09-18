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
import { downloadCSV, buildDownloadName } from "../../utils/downloadUtils"; // ← add buildDownloadName
import { toSourceVirus, coerceRowVirus, coerceRowView } from "../../utils/virusMap";

import FloatingTogglePill from "../controls/FloatingTogglePill";
import MarkdownParagraphSection from "../contentUtils/MarkdownParagraphSection";
import { tokens } from "../../styles/tokens";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import CombinedVirusChart from "../charts/CombinedVirusChart";
import DynamicParagraph from "../sections/DynamicParagraph";
import SeasonalBullet from "../bullets/SeasonalBullet"

import HydratedDataContext from "../../context/HydratedDataContext";

import {
  getTrendFromTimeSeries,
  generateTrendSubtitle,
  formatDate,
  coerceNoChange,
  formatTrendPhrase,
  capitalizeFirstHtml,
  getTrendInfo,
  getLatestWeekFromData,
  getLatestWeek,
  isFirstWeekFromData
} from "../../utils/trendUtils";

import { loadConfigWithData } from "../../utils/loadConfigWithData";
import { getGroupOptions } from "../../utils/getGroupOptions";
import StatGrid from "../grids/StatGrid";
import OverviewGrid from "../grids/OverviewGrid";
import ToggleControls from "../controls/ToggleControls";
import GroupDropdown from "../controls/GroupDropdown";
import TrendSubtitle from "../controls/TrendSubtitle";
import "./ConfigDrivenPage.css";

const customComponents = {
  StatGrid,
  OverviewGrid,
  CombinedVirusChart,
  DynamicParagraph,
  SeasonalBullet
};

const viewDisplayLabels = {
  visits: "Visits",
  hospitalizations: "Hospitalizations",
};

const virusLowercaseDisplay = {
  "COVID-19": "COVID-19",
  Flu: "flu",
  RSV: "RSV",
};

const viewDisplayLabelsPreposition = {
  visits: "to",
  hospitalizations: "from",
};

const virusDisplayLabelsArticle = {
  "COVID-19": "a",
  Flu: "a",
  RSV: "an",
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

const displayVirus = (v) => (v === "Influenza" ? "Flu" : v);


const resolveText = (input, variables = {}) => {
  const raw =
    typeof input === "string" && input.includes(".") ? getText(input) : input;
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
  const { titleKey, subtitleKey, summary, sections = [], controls = {} } =
    config;

  const pageState = usePageState(config.data, controls);
  const {
    activeVirus = "COVID-19",
    view = "visits",
    dataType = "ed",
    setDataType = () => {},
    handleDownload = () => {},
    setView = () => {},
    setVirus = () => {},
  } = pageState;

  // --- SUMMARY FIXES (resolve per dataType) ----------------------
  const resolvedSummary =
    summary && (summary.ed || summary.lab || summary.death)
      ? (summary[dataType] || summary.default || {})
      : (summary || {});

  const resolvedSummaryMarkdownPath =
    typeof resolvedSummary.markdownPath === "object"
      ? resolvedSummary.markdownPath[dataType] || resolvedSummary.markdownPath.default
      : resolvedSummary.markdownPath;
  // --------------------------------------------------------------

  const [hydratedConfig, setHydratedConfig] = useState(null);
  const [groupSelections, setGroupSelections] = useState({});

  const updateGroup = (key, val) => {
    setGroupSelections((prev) => ({ ...prev, [key]: val }));
  };


  

  const [showPill, setShowPill] = useState(false);
  const controlsRef = useRef(null);

  
  // Find the nearest scrollable ancestor; fall back to window
  const getScrollParent = (node) => {
    if (!node) return window;
    const regex = /(auto|scroll|overlay)/;
    let el = node.parentElement;
    while (el) {
      const cs = getComputedStyle(el);
      if (regex.test(cs.overflowY) || regex.test(cs.overflow)) return el;
      el = el.parentElement;
    }
    return window;
  };
  
  useEffect(() => {
    if (!controlsRef.current) return;
  
    const observer = new IntersectionObserver(
      ([entry]) => setShowPill(!entry.isIntersecting),
      { root: null, threshold: 0 }
    );
  
    observer.observe(controlsRef.current);
    return () => observer.disconnect();
  }, [activeVirus, view, dataType]);
  
  
  

  useEffect(() => {
    if (config.data) {
      setHydratedConfig(config);
      return;
    }
    const selectedVirus = activeVirus || config.defaultVirus || "COVID-19";
    const selectedView = view || config.defaultView || "visits";
    const safeDataType = dataType || "ed";

    loadConfigWithData(config, {
      virus: selectedVirus,
      view: selectedView,
      dataType: safeDataType,
    })
      .then(setHydratedConfig)
      .catch(console.error);
  }, [config, activeVirus, view, dataType]);

  // (Removed: old summary markdown prefetch that referenced summary.markdownPath)

  if (!hydratedConfig) return <div className="loading"></div>;
  const { data = {}, sections: hydratedSections = [] } = hydratedConfig;

  const pageTextVars = {
    virus: activeVirus,
    view,
    dataType,
    viewLabel: viewDisplayLabels[view],
    viewLabelPreposition: viewDisplayLabelsPreposition[view],
    virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
    virusLowercase: virusLowercaseDisplay[activeVirus],
  };

  const latestDate = getLatestWeek(data)

  const resolvedTitleKey =
    typeof titleKey === "object" ? titleKey[dataType] : titleKey;
  const resolvedSubtitleKey =
    typeof subtitleKey === "object" ? subtitleKey[dataType] : subtitleKey;

  return (
    <HydratedDataContext.Provider value={{ data }}>
      <DataPageLayout
        title={resolveText(resolvedTitleKey, pageTextVars)}
        subtitle={resolveText(resolvedSubtitleKey, pageTextVars)}
        topControls={
          config.showTopControls === false ? null : (
            <div ref={controlsRef}>
              <TopControls
                controls={controls}
                activeVirus={activeVirus}
                onVirusChange={setVirus}
                dataType={dataType}
                onDataTypeChange={setDataType}
                view={view}
                onViewChange={setView}
              />
            </div>
          )
        }
      >
        {resolvedSummaryMarkdownPath && (
          <TrendSummaryContainer
            key={`summary-${activeVirus}-${view}-${dataType}`}
            sectionTitle={resolveText(resolvedSummary.titleKey || resolvedSummary.title)}
            date={latestDate}
            markdownPath={resolvedSummaryMarkdownPath}
            showTitle
            animateOnScroll={resolvedSummary.animateOnScroll !== false}
            virus={activeVirus}
            view={view}
            virusLowercase={virusLowercaseDisplay[activeVirus]}
            virusLabelArticle={virusDisplayLabelsArticle[activeVirus]}
            {...(resolvedSummary.showTrendArrow ? { trendDirection: "up" } : {})}
            variables={{
              ...pageTextVars,
              latestDate,
            }}
          >
            {Array.isArray(resolvedSummary?.bullets) &&
              activeVirus === "Flu" &&
              resolvedSummary.bullets.map((b) => {
                if (b.renderAs === "custom" && b.component && customComponents[b.component]) {
                  const Cmp = customComponents[b.component];
                  const slice = b.dataSourceKey ? data?.[b.dataSourceKey] : undefined;
                  const cfg = { id: b.id, ...(b.componentProps || {}) };
                  return (
                    <Cmp
                      key={b.id}
                      config={cfg}
                      dataSource={slice}
                      pageState={{ virus: activeVirus, dataType }}
                      as={b.componentProps?.as}
                      className={b.componentProps?.className}
                    />
                  );
                }
                const slice =
                  b.dataSourceKey && data?.[b.dataSourceKey] ? data[b.dataSourceKey] : undefined;
                return (
                  <SeasonalBullet
                    key={b.id}
                    config={b}
                    dataSource={slice}
                    pageState={{ virus: activeVirus, dataType }}
                  />
                );
              })}
          </TrendSummaryContainer>

        )}
        {/* -------------------------------------------------------------------------- */}

        {hydratedSections
        
          .filter((section) => {
            const allowed = section.showIfVirus;
            const allowedDataType = section.dataType;
            const matchesDataType =
              !allowedDataType || allowedDataType === dataType;
            
              const matchesVirus =
               !allowed ||
               (Array.isArray(allowed)
               ? allowed.some((v) => displayVirus(v) === activeVirus)
               : displayVirus(allowed) === activeVirus);

            return matchesDataType && matchesVirus;
          })
          .map((section, idx) => {
            const key = section.id || idx;
            const textVars = {
              virus: activeVirus,
              view,
              displayView: `<span class="bg-highlight">${viewDisplayLabels[view]}</span>`,
              viewLabelPreposition: viewDisplayLabelsPreposition[view],
              viewLabel: viewDisplayLabels[view],
              virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
              virusLowercase: virusLowercaseDisplay[activeVirus],
            };

            let interpolatedProps = interpolateObject(
              section.chart?.props || {},
              textVars
            );

            if (section.chart?.props?.getMetricNames) {
              interpolatedProps.metricName =
                section.chart.props.getMetricNames({
                  virus: activeVirus,
                  view,
                });
            }
            if (interpolatedProps.submetric === "undefined") {
              interpolatedProps.submetric = undefined;
            }

            const dataSourceKey =
              section.dataSourceKey ||
              interpolatedProps.dataSourceKey ||
              section.chart?.props?.dataSourceKey ||
              null;

            const filteredData =
              dataSourceKey && data[dataSourceKey] ? data[dataSourceKey] : [];

            if (section.renderAs === "overview" || section.renderAs === "hidden")
              return null;

            /** ---------- CUSTOM COMPONENT BRANCH ---------- */
            if (section.renderAs === "custom") {
              const CustomComponent = customComponents[section.component];
              if (!CustomComponent) return null;

              const chartProps = interpolateObject(
                section.chart?.props || {},
                textVars
              );
              const compProps = interpolateObject(
                section.componentProps || {},
                textVars
              );
              const mergedProps = { ...compProps, ...chartProps };

              // Build subtitle variables safely (combined-virus needs date/trend)
              let subtitleVars = { ...textVars };

              if (section.id === "combined-virus") {
                // combined-virus uses ARI series for the WoW trend
                const seriesKey =
                  view === "visits" ? "ARI visits" : "ARI hospitalizations";
                const ariSeries = Array.isArray(filteredData)
                  ? filteredData
                  : filteredData?.[seriesKey] || [];

                const last = ariSeries?.at?.(-1) || {};
                const latestISO = last.week || last.date || null;

                const trendObjRaw = getTrendFromTimeSeries(ariSeries, "value");
                const trendObj = coerceNoChange(trendObjRaw);
                const trendText = trendObj ? formatTrendPhrase(trendObj) : "not available";

                subtitleVars = {
                  ...subtitleVars,
                  date: latestISO ? formatDate(latestISO) : "N/A",
                  trend: trendText,
                  trendDirection: trendObj?.direction || "same",
                };
              }

              // Safely resolve the raw subtitle template from text.json (or plain string)
              const rawSubtitleTemplate =
                typeof section.subtitle === "string"
                  ? getText(section.subtitle)
                  : section.subtitle || "";

              const wrapInChart = section.wrapInChart !== false; // default true

              const componentNode = (
                <CustomComponent
                  {...(Array.isArray(filteredData) ? { data: filteredData } : { data: filteredData })}
                  view={view}
                  onViewChange={setView}
                  {...mergedProps}
                />
              );

              return (
                <ContentContainer
                  key={key}
                  title={resolveText(section.title, textVars)}
                  subtitle={rawSubtitleTemplate}
                  subtitleVariables={subtitleVars}
                  animateOnScroll={section.animateOnScroll !== false}
                  background={section.background || "white"}
                  infoIcon={section.infoIcon}
                  downloadIcon={section.downloadIcon}
                  downloadPreviewData={Array.isArray(filteredData) ? filteredData : Object.values(filteredData || {}).flat()}
                  downloadColumnLabels={interpolatedProps.columnLabels}
                  downloadDescription={interpolatedProps.downloadDescription}
                  modalTitle={resolveText(section.modal?.title, textVars)}
                  modalContent={
                    section.modal?.markdownPath && (
                      <MarkdownRenderer
                        filePath={section.modal.markdownPath}
                        sectionTitle={resolveText(
                          section.modal.title || "",
                          textVars
                        )}
                        showTitle={false}
                        variables={textVars}
                      />
                    )
                  }
                  onDownloadClick={() => {
                    // Export exactly what this section is rendering
                    const exportRows = Array.isArray(filteredData)
                      ? filteredData
                      : Object.entries(filteredData || {}).flatMap(([seriesName, rows]) =>
                          (rows || []).map((row) => ({
                            ...row,
                            series: String(seriesName)
                              .replace(" visits", "")
                              .replace(" hospitalizations", "")
                              .replace("COVID-19", "COVID")
                              .replace("Influenza", "Flu"),
                          }))
                        );

                    // Build a sensible name:
                    // - for the combined-virus overview, use "ARI" as the virus label
                    // - include view only for ED data
                    const virusForFile = section.id === "combined-virus" ? "ARI" : activeVirus;
                    const metricForFile = dataType === "ed" ? view : undefined;
                    const categoryForFile = section.id || "section";

                    const fileName =
                      section.chart?.props?.downloadFileName ||
                      buildDownloadName({
                        virus: virusForFile,
                        metric: metricForFile,
                        category: categoryForFile,
                        date: latestDate,
                        ext: "csv",
                      });

                    // If we have rendered rows, download them.
                    if (exportRows && exportRows.length) {
                      downloadCSV(exportRows, fileName);
                      return;
                    }

                    // Fallback: if this custom section points to a static CSV, download that.
                    const rawPath = section.componentProps?.dataPath || section.chart?.props?.dataPath;
                    if (rawPath) {
                      const a = document.createElement("a");
                      a.href = rawPath;
                      a.download = fileName;
                      a.style.display = "none";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }}
                >
                  {wrapInChart ? (
                    <ChartContainer
                      title={resolveText(section.title, textVars)}
                      chart={
                        <CustomComponent
                          {...(Array.isArray(filteredData)
                            ? { data: filteredData }
                            : { data: filteredData })}
                          view={view}
                          onViewChange={setView}
                          {...mergedProps}
                        />
                      }
                      {...(section.showSidebarToggle
                        ? {
                            sidebar: (
                              <ToggleControls
                                data={
                                  Array.isArray(filteredData)
                                    ? filteredData
                                    : Object.values(filteredData || {}).flat()
                                }
                                view={view}
                                onToggle={setView}
                              />
                            ),
                          }
                        : {})}
                      stackSidebarAbove={!!section.sidebarAboveChart}
                      footer={section.chart.footer}
                    />
                  ) : (
                    componentNode
                  )}
                </ContentContainer>
              );
            }

            /** ---------- DEFAULT (NON-CUSTOM) BRANCH ---------- */
            const groupField = section.chart?.props?.groupField;
            const groupLabel = section.chart?.props?.groupLabel || "All Groups";
            const safeDataArray = Array.isArray(filteredData)
              ? filteredData
              : [];
            const groupOptions = getGroupOptions(
              safeDataArray,
              groupField,
              groupLabel
            );
            const activeGroup = groupSelections[key] ?? groupOptions[0] ?? null;

            const normalizedGroup = (activeGroup || "").trim();
            const normalizedLabel = (groupLabel || "").trim();
            const groupDisplay =
              groupDisplayNames[normalizedGroup] || normalizedGroup;

            const isMultiSeries =
              typeof filteredData === "object" && !Array.isArray(filteredData);
            const flattenedData = isMultiSeries
              ? Object.entries(filteredData).flatMap(([seriesName, rows]) =>
                  (rows || []).map((row) => ({
                    ...row,
                    series: seriesName,
                  }))
                )
              : filteredData;

            const groupFilteredData =
              !activeGroup || activeGroup === groupLabel
                ? flattenedData
                : flattenedData.filter((d) => d[groupField] === activeGroup);

              const sourceVirusForFilter = toSourceVirus(activeVirus);
              
              const virusFilteredData =
                groupFilteredData?.filter?.((row) => {
                // normalize both sides to SOURCE labels ('Influenza', 'COVID-19', 'RSV')
               const vRaw = coerceRowVirus(row);
               const v = vRaw ? toSourceVirus(vRaw) : null;
               const vw = coerceRowView(row);
               if (v && vw) return v === sourceVirusForFilter && vw === view;
               // fallback to legacy substring behavior if needed
               const series = String(row.series || row.metric || row.virus || "");
               return series.includes(`${sourceVirusForFilter} ${view}`);
              }) ?? [];

            const trendKey = section.chart?.props?.yField || view;
            const trendObj = section.trendEnabled
              ? getTrendFromTimeSeries(virusFilteredData, trendKey)
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

            const latestWeek = getLatestWeekFromData(groupFilteredData);
            const isFirstWeek = isFirstWeekFromData(groupFilteredData)

            const groupLabelText =
              normalizedGroup && normalizedGroup !== normalizedLabel
                ? `in ${groupDisplay}`
                : `across ${normalizedLabel.toLowerCase()}`;



                
                // build "increased 30%" robustly, regardless of upstream value shape
            const labelPlusValue = trendObj
            ? `${trendObj.label}${trendObj.value != null && String(trendObj.value).trim() !== "" ? " " + String(trendObj.value).trim() : ""}`
            : "not changed";

            // append % to the LAST number in the phrase if no % is present anywhere
            const labelPlusValuePct = /%/.test(labelPlusValue)
            ? labelPlusValue
            : labelPlusValue.replace(/(-?\d+(?:\.\d+)?)(?!.*\d)/, "$1%");

            const fullVars = {
            ...textVars,
            date: `<span class="bg-highlight">${formatDate(latestWeek)}</span>`,
            trend: `<span class="${trendClass}">${labelPlusValuePct}</span>`,  // ← use this
            group: groupLabelText,
            trendDirection: trendObj?.direction,
            arrow: trendInfo?.arrow,
            viewLabel: viewDisplayLabels[view],
            viewLabelPreposition: viewDisplayLabelsPreposition[view],
            virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
            virusLowercase: virusLowercaseDisplay[activeVirus],
            directionText: trendInfo?.directionText,
            trendColor: trendInfo?.trendColor,
            };

                

            const rawSubtitleTemplate = resolveText(section.subtitle);

            const computedSubtitle = (
              isFirstWeek ? null :
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
              colorMap: tokens.colorScales?.[(activeVirus || "").toLowerCase()],
              tooltip: true,
            };

            if (
              section.chart?.type?.toLowerCase().includes("line") &&
              !resolvedProps.xField
            ) {
              resolvedProps.xField = "date";
            }

            // For filenames, use the selected group when one is chosen; else the section id
            const categoryForFile =
              normalizedGroup && normalizedGroup !== normalizedLabel
                ? normalizedGroup
                : section.id || "chart";

            // include view in filename only for ED data
            const metricForFile = dataType === "ed" ? view : undefined;

            return (
              <SectionWithChart
                key={key}
                title={resolveText(section.title, fullVars)}
                subtitle={computedSubtitle}
                subtitleVariables={fullVars}
                infoIcon={section.infoIcon}
                downloadIcon={section.downloadIcon}
                onDownloadClick={() => {
                  const flattened = Array.isArray(groupFilteredData)
                    ? groupFilteredData
                    : Object.entries(groupFilteredData || {}).flatMap(([seriesName, rows]) =>
                        (rows || []).map((row) => ({
                          ...row,
                          series: seriesName
                            .replace(" visits", "")
                            .replace(" hospitalizations", "")
                            .replace("COVID-19", "COVID")
                            .replace("Influenza", "Flu"),
                        }))
                      );

                  if (!flattened?.length) return;

                  const fileName =
                    section.chart?.props?.downloadFileName ||
                    buildDownloadName({
                      virus: activeVirus,
                      metric: metricForFile,           // ← omit for case/death
                      category: categoryForFile,
                      date: latestDate,
                      ext: "csv",
                      includeMetric: !(dataType === "cases" || dataType === "deaths"),
                    });

                  downloadCSV(flattened, fileName);
                }}
                
                columnLabels={interpolatedProps.columnLabels}
                modalTitle={resolveText(section.modal?.title, fullVars)}
                modalContent={
                  section.modal?.markdownPath && (
                    <MarkdownRenderer
                      filePath={section.modal.markdownPath}
                      sectionTitle={resolveText(
                        section.modal.title || "",
                        fullVars
                      )}
                      showTitle={false}
                      variables={fullVars}
                    />
                  )
                }
                animateOnScroll={section.animateOnScroll !== false}
                previewData={
                  section.id === "combined-virus"
                  ? Object.entries(data[dataSourceKey] || {})
                  .flatMap(([seriesName, rows]) =>
                        (rows || []).map((row) => ({
                          ...row,
                          series: seriesName
                            .replace(" visits", "")
                            .replace(" hospitalizations", "")
                            .replace("COVID-19", "COVID")
                            .replace("Influenza", "Flu"),
                        }))
                      )
                    : groupFilteredData
                }
                {...(section.id === "combined-virus"
                  ? {
                      viewToggle: controls.viewToggle,
                      view,
                      onViewChange: setView,
                    }
                  : {})}
              >
                <ChartContainer
                  title={resolveText(section.title, fullVars)}
                  chart={<ChartComponent {...resolvedProps} />}
                  {...(section.showSidebarToggle
                    ? {
                        sidebar: (
                          <ToggleControls
                            data={
                              Array.isArray(filteredData)
                                ? filteredData
                                : Object.values(filteredData).flat()
                            }
                            view={view}
                            onToggle={setView}
                          />
                        ),
                      }
                    : {})}
                  stackSidebarAbove={!!section.sidebarAboveChart}
                  footer={section.chart.footer}
                />
              </SectionWithChart>
            );
          })}
      </DataPageLayout>

      {config.showPillToggle !== false && (
        <FloatingTogglePill
          className={showPill ? "visible" : ""}
          activeVirus={activeVirus}
          dataType={dataType}
          onDataTypeChange={setDataType}
          view={view}
          viewLabel={viewDisplayLabels[view]}
          onVirusChange={setVirus}
          onViewChange={setView}
          controls={controls}
        />
      )}
   </HydratedDataContext.Provider>
  );
};

ConfigDrivenPage.propTypes = {
  config: PropTypes.object.isRequired,
};

export default ConfigDrivenPage;
