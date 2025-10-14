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
import { downloadCSV, buildDownloadName } from "../../utils/downloadUtils";
import { toSourceVirus, coerceRowVirus, coerceRowView } from "../../utils/virusMap";

import FloatingTogglePill from "../controls/FloatingTogglePill";
import { tokens } from "../../styles/tokens";
import chartRegistry from "../../utils/chartRegistry";
import { getText } from "../../utils/contentUtils";
import CombinedVirusChart from "../charts/CombinedVirusChart";
import DynamicParagraph from "../sections/DynamicParagraph";
import SeasonalBullet from "../bullets/SeasonalBullet";

import HydratedDataContext from "../../context/HydratedDataContext";

import {
  getTrendFromTimeSeries,
  getLastTwoValuesSameSeries,
  formatDate,
  formatTrendPhrase,
  coerceNoChange,
  getTrendInfo,
  getLatestWeekFromData,
  getLatestWeek,
  isFirstWeekFromData,
  parseLocalISO,
  EPSILON_NO_CHANGE,
} from "../../utils/trendUtils";

import { loadConfigWithData } from "../../utils/loadConfigWithData";
import { getGroupOptions } from "../../utils/getGroupOptions";
import StatGrid from "../grids/StatGrid";
import OverviewGrid from "../grids/OverviewGrid";
import ToggleControls from "../controls/ToggleControls";
import TrendSubtitle from "../controls/TrendSubtitle";
import "./ConfigDrivenPage.css";

/* ---------------------------------------
 * Custom components available to config
 * ------------------------------------- */
const customComponents = {
  StatGrid,
  OverviewGrid,
  CombinedVirusChart,
  DynamicParagraph,
  SeasonalBullet,
};

/* ---------------------------------------
 * Display helpers / dictionaries
 * ------------------------------------- */
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

/* ---------------------------------------
 * Small helpers
 * ------------------------------------- */

const renderSubtitle = (template, variables, groupProps) => {
  if (!template) return null;
  const t =
    typeof template === "string" && template.includes(".")
      ? getText(template)
      : template;
  return (
    <TrendSubtitle
      template={t || ""}
      variables={variables || {}}
      groupProps={groupProps}
    />
  );
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

/** Interpret numbers reliably */
const toNum = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v.replace(/[%\s,]+/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

/** Human-readable metric label for subtitle when view isn't applicable. */
function resolveMetricLabel({ dataType, view }) {
  if (dataType === "ed") {
    return viewDisplayLabels[view] || "Visits";
  }
  if (dataType === "cases" || dataType === "lab") return "Cases";
  if (dataType === "deaths" || dataType === "death") return "Deaths";
  return "Value";
}

/* ============================================================================================
 * MAIN COMPONENT
 * ==========================================================================================*/

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

  // --- SUMMARY FIX (resolve per dataType) ----------------------
  const resolvedSummary =
    summary && (summary.ed || summary.lab || summary.death || summary.cases)
      ? summary[dataType] || summary.default || {}
      : summary || {};

  const resolvedSummaryMarkdownPath =
    typeof resolvedSummary?.markdownPath === "object"
      ? resolvedSummary.markdownPath[dataType] ||
        resolvedSummary.markdownPath.default
      : resolvedSummary?.markdownPath;
  // ------------------------------------------------------------

  const [hydratedConfig, setHydratedConfig] = useState(null);
  const [groupSelections, setGroupSelections] = useState({});
  const updateGroup = (key, val) =>
    setGroupSelections((prev) => ({ ...prev, [key]: val }));

  const [showPill, setShowPill] = useState(false);
  const controlsRef = useRef(null);

  // Sticky toggle pill trigger
  useEffect(() => {
    if (!controlsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowPill(!entry.isIntersecting),
      { root: null, threshold: 0 }
    );
    observer.observe(controlsRef.current);
    return () => observer.disconnect();
  }, [activeVirus, view, dataType]);

  // Load config + data if needed
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

  if (!hydratedConfig) return <div className="loading"></div>;
  const { data = {}, sections: hydratedSections = [] } = hydratedConfig;

  // Base tokens for text replacement
  const pageTextVars = {
    virus: activeVirus,
    virusSource: toSourceVirus(activeVirus),
    view,
    dataType,
    viewLabel: viewDisplayLabels[view],
    viewLabelPreposition: viewDisplayLabelsPreposition[view],
    virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
    virusLowercase: virusLowercaseDisplay[activeVirus],
  };

  const latestDate = getLatestWeek(data);
  const resolvedTitleKey =
    typeof titleKey === "object" ? titleKey[dataType] : titleKey;
  const resolvedSubtitleKey =
    typeof subtitleKey === "object" ? subtitleKey[dataType] : subtitleKey;

  /* ---------------------------------------
   * Render
   * ------------------------------------- */
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
            sectionTitle={resolveText(
              resolvedSummary.titleKey || resolvedSummary.title
            )}
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
                if (
                  b.renderAs === "custom" &&
                  b.component &&
                  customComponents[b.component]
                ) {
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
                  b.dataSourceKey && data?.[b.dataSourceKey]
                    ? data[b.dataSourceKey]
                    : undefined;
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

        {/* ---------------------- Sections ---------------------- */}
        {hydratedSections
          .filter((section) => {
            const allowed = section.showIfVirus;
            const allowedDataType = section.dataType;

            const matchesDataType =
              !allowedDataType ||
              String(allowedDataType).toLowerCase() ===
                String(dataType).toLowerCase();

            // Normalize both sides, map "Influenza" -> "Flu", and compare case-insensitively
            const normalizeVirus = (v) =>
              v ? displayVirus(String(v)).toLowerCase() : "";
            const activeVirusNorm = normalizeVirus(activeVirus);

            const matchesVirus = !allowed
              ? true
              : Array.isArray(allowed)
              ? allowed.some((v) => normalizeVirus(v) === activeVirusNorm)
              : normalizeVirus(allowed) === activeVirusNorm;

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

            // If config provides a dynamic name, keep it. Otherwise ensure later matching is robust.
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

            /* ---------- CUSTOM SECTION BRANCH ---------- */
            if (section.renderAs === "custom") {
              if (section.component) {
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

                // Subtitle vars (e.g., combined-virus needs date/trend)
                let subtitleVars = { ...textVars };

                if (section.id === "combined-virus") {
                  const seriesKey =
                    view === "visits"
                      ? "Respiratory illness visits"
                      : "Respiratory illness hospitalizations";
                  const ariSeries = Array.isArray(filteredData)
                    ? filteredData
                    : filteredData?.[seriesKey] || [];

                  const last = ariSeries?.at?.(-1) || {};
                  const latestISO = last.week || last.date || null;

                  const trendObj = getTrendFromTimeSeries(ariSeries, "value");
                  const trendText = trendObj
                    ? formatTrendPhrase(trendObj)
                    : "not changed";

                  subtitleVars = {
                    ...subtitleVars,
                    date: latestISO ? formatDate(latestISO) : "N/A",
                    trend: trendText,
                    trendDirection: trendObj?.direction || "same",
                  };
                }

                const customSubtitleNode = renderSubtitle(
                  section.subtitle,
                  subtitleVars
                );

                const wrapInChart = section.wrapInChart !== false;

                const componentNode = (
                  <CustomComponent
                    {...(Array.isArray(filteredData)
                      ? { data: filteredData }
                      : { data: filteredData })}
                    view={view}
                    onViewChange={setView}
                    {...mergedProps}
                  />
                );

                const latestDateForName = getLatestWeek(data);

                return (
                  <ContentContainer
                    key={key}
                    title={resolveText(section.title, textVars)}
                    subtitle={customSubtitleNode}
                    subtitleVariables={subtitleVars}
                    animateOnScroll={section.animateOnScroll !== false}
                    background={section.background || "white"}
                    infoIcon={section.infoIcon}
                    downloadIcon={section.downloadIcon}
                    downloadPreviewData={
                      Array.isArray(filteredData)
                        ? filteredData
                        : Object.values(filteredData || {}).flat()
                    }
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
                      const exportRows = Array.isArray(filteredData)
                        ? filteredData
                        : Object.entries(filteredData || {}).flatMap(
                            ([seriesName, rows]) =>
                              (rows || []).map((row) => ({
                                ...row,
                                series: String(seriesName)
                                  .replace(" visits", "")
                                  .replace(" hospitalizations", "")
                                  .replace("COVID-19", "COVID")
                                  .replace("Influenza", "Flu"),
                              }))
                          );

                      const virusForFile =
                        section.id === "combined-virus" ? "ARI" : activeVirus;
                      const metricForFile = dataType === "ed" ? view : undefined;
                      const categoryForFile = section.id || "section";

                      const fileName =
                        section.chart?.props?.downloadFileName ||
                        buildDownloadName({
                          virus: virusForFile,
                          metric: metricForFile,
                          category: categoryForFile,
                          date: latestDateForName,
                          ext: "csv",
                        });

                      if (exportRows && exportRows.length) {
                        downloadCSV(exportRows, fileName);
                        return;
                      }

                      const rawPath =
                        section.componentProps?.dataPath ||
                        section.chart?.props?.dataPath;
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
                        footer={section.chart?.footer}
                        altTableData={
                          Array.isArray(filteredData)
                            ? filteredData
                            : Object.values(filteredData || {}).flat()
                        }
                        altTableVariables={textVars}
                        altTableColumns={section.chart?.altTable?.columns}
                        altTableCaption={
                          section.chart?.altTable?.caption ||
                          resolveText(section.title, textVars)
                        }
                        altTableSrOnly={section.chart?.altTable?.srOnly ?? true}
                      />
                    ) : (
                      componentNode
                    )}
                  </ContentContainer>
                );
              }

              // ---- Simple paragraph (no component, no chart) ----
              const subtitleVars = { ...textVars };
              const customSubtitleNode = renderSubtitle(
                section.subtitle,
                subtitleVars
              );

              const bodyHtml =
                resolveText(section.textKey, subtitleVars) ??
                section.text ??
                "";

              return (
                <ContentContainer
                  key={key}
                  title={resolveText(section.title, textVars)}
                  subtitle={customSubtitleNode}
                  subtitleVariables={subtitleVars}
                  animateOnScroll={section.animateOnScroll !== false}
                  background={section.background || "white"}
                  infoIcon={section.infoIcon}
                  downloadIcon={false}
                >
                  <div className="markdown-body">
                    {typeof bodyHtml === "string" ? <p>{bodyHtml}</p> : bodyHtml}
                  </div>
                </ContentContainer>
              );
            }

            /* ---------- DEFAULT (NON-CUSTOM) BRANCH ---------- */

            // Group UI state
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
            const activeGroup =
              groupSelections[key] ?? groupOptions[0] ?? null;

            const normalizedGroup = (activeGroup || "").trim();
            const normalizedLabel = (groupLabel || "").trim();
            const groupDisplay =
              groupDisplayNames[normalizedGroup] || normalizedGroup;

            // Flatten multi-series datasets
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

            // Apply group filter for CHART DISPLAY
            const groupFilteredData =
              !activeGroup || activeGroup === groupLabel
                ? flattenedData
                : flattenedData.filter((d) => d[groupField] === activeGroup);

            // Virus filter helper
            const sourceVirusForFilter = toSourceVirus(activeVirus);
            const filterByVirus = (rows) =>
              rows?.filter?.((row) => {
                const vRaw = coerceRowVirus(row);
                const v = vRaw ? toSourceVirus(vRaw) : null;
                if (v) return v === sourceVirusForFilter;
                const series = String(
                  row.series || row.metric || row.virus || ""
                );
                return series
                  .toLowerCase()
                  .includes(sourceVirusForFilter.toLowerCase());
              }) ?? [];

            // CHART DATA (respects group for visual display)
            const virusFilteredData =
              dataType === "ed"
                ? groupFilteredData.filter((row) => {
                    const vRaw = coerceRowVirus(row);
                    const v = vRaw ? toSourceVirus(vRaw) : null;
                    const vw = coerceRowView(row);
                    if (v && vw) return v === sourceVirusForFilter && vw === view;
                    const series = String(
                      row.series || row.metric || row.virus || ""
                    );
                    return series
                      .toLowerCase()
                      .includes(
                        `${sourceVirusForFilter} ${view}`.toLowerCase()
                      );
                  })
                : filterByVirus(groupFilteredData);

            // Resolve the chart's metric name safely (string only)
            let chartMetricName = interpolatedProps.metricName;
            if (Array.isArray(chartMetricName)) {
              chartMetricName = chartMetricName[0] ?? "";
            }
            if (chartMetricName == null) chartMetricName = "";

            const srcVirus = toSourceVirus(activeVirus); // e.g., "Flu" -> "Influenza"
            const uiVirus = activeVirus;
            if (chartMetricName) {
              chartMetricName = chartMetricName
                .replace(/\bFlu\b/g, "Influenza")
                .replace(/\bCOVID\b/g, "COVID-19");
              if (uiVirus !== srcVirus) {
                const re = new RegExp(`\\b${uiVirus}\\b`, "g");
                chartMetricName = chartMetricName.replace(re, srcVirus);
              }
            }

            // CHART working data
            const workingData = virusFilteredData?.length
              ? virusFilteredData
              : groupFilteredData?.length
              ? groupFilteredData
              : flattenedData;

            // If we still don't have a metric name, infer it from the latest row with a metric
            if (!chartMetricName && workingData?.length) {
              const lastWithMetric = [...workingData]
                .reverse()
                .find((r) => r?.metric);
              chartMetricName = String(lastWithMetric?.metric ?? "");
            }

            /* ===== STRICT TREND SELECTION to match TrendSubtitle + cases config =====
             * - LAB/CASES: exact metric "{Virus} cases", submetric "Total"
             * - DEATHS:    exact metric "{Virus} deaths", submetric "Total"
             * - ED:        respect {view} and (if selected) group; otherwise same-series
             * - Seasonal datasets: only the latest season
             */

            // --- unified trend pool selection ---
            let trendPoolBase;
            if (dataType === "ed") {
              // ED: use the already-filtered working data
              trendPoolBase = workingData;
            } else if (dataType === "death" || dataType === "deaths") {
              // DEATHS: Use the section's actual data source
              // flattenedData is the processed data being displayed in the chart
              trendPoolBase = flattenedData?.length ? flattenedData : workingData;
              console.log("[TREND deaths] Pool size:", trendPoolBase.length, "Last 3:", trendPoolBase.slice(-3));
            } else if (dataType === "lab" || dataType === "cases") {
              // CASES: Use the section's actual data source
              trendPoolBase = flattenedData?.length ? flattenedData : workingData;
              console.log("[TREND cases] Pool size:", trendPoolBase.length, "Last 3:", trendPoolBase.slice(-3));
            } else {
              // Fallback for any other data type
              trendPoolBase = filterByVirus(flattenedData);
            }

            // If there are seasons in the data, keep only latest season
            let trendData = trendPoolBase;
            if (trendData?.length && "season" in (trendData[0] || {})) {
              const lastSeason = [...trendData]
                .filter((r) => r?.season != null)
                .reduce((acc, r) => {
                  const d = parseLocalISO(
                    r?.date ?? r?.week ?? r?.dateStr
                  );
                  const ts = d ? d.getTime() : -Infinity;
                  const prev = acc.get(r.season) ?? -Infinity;
                  if (ts > prev) acc.set(r.season, ts);
                  return acc;
                }, new Map());
              const latestSeason = [...lastSeason.entries()].sort(
                (a, b) => b[1] - a[1]
              )[0]?.[0];
              if (latestSeason) {
                trendData = trendData.filter((r) => r.season === latestSeason);
                console.log(`[TREND] Filtered to latest season: ${latestSeason}, rows: ${trendData.length}`);
              }
            }

            // Desired metric string for lab/cases/deaths
            const desiredMetric =
              dataType === "deaths" || dataType === "death"
                ? `COVID-19 deaths`  // Match exactly what's in your CSV
                : dataType === "lab" || dataType === "cases"
                ? `${srcVirus} cases`  // This will be "COVID-19 cases", "Influenza cases", or "RSV cases"
                : null;

            const totalNames = [
              "Total",
              "All",
              "Overall",
              "All Ages",
              "All Boroughs",
            ];
            const isTotal = (s) =>
              totalNames.includes(String(s || "").trim());

            // Debug logging for deaths and cases
            if (dataType === "deaths" || dataType === "death") {
              console.log("[DEBUG deaths-series filter]", {
                desiredMetric,
                availableMetrics: [...new Set((trendData || []).map(r => r.metric))],
                availableSubmetrics: [...new Set((trendData || []).map(r => r.submetric))],
                lastRows: (trendData || []).slice(-3),
                trendDataLength: trendData?.length,
              });
            }
            
            if (dataType === "lab" || dataType === "cases") {
              console.log("[DEBUG cases-series filter]", {
                desiredMetric,
                srcVirus,
                availableMetrics: [...new Set((trendData || []).map(r => r.metric))],
                availableSubmetrics: [...new Set((trendData || []).map(r => r.submetric))],
                lastRows: (trendData || []).slice(-3),
                trendDataLength: trendData?.length,
              });
            }
              
            // Start with a *strict* filtered series when applicable
            let seriesForTrend =
              desiredMetric
                ? (trendData || []).filter(
                    (r) =>
                      String(r?.metric) === desiredMetric &&
                      isTotal(r?.submetric)
                  )
                : (trendData || []);

            console.log(`[TREND] After metric filter: ${seriesForTrend.length} rows`);

            // ED only: if grouped, allow trend to respect active group
            if (
              dataType === "ed" &&
              activeGroup &&
              activeGroup !== groupLabel &&
              groupField
            ) {
              seriesForTrend = seriesForTrend.filter(
                (r) => String(r[groupField]) === String(activeGroup)
              );
              console.log(`[TREND ED] After group filter (${activeGroup}): ${seriesForTrend.length} rows`);
            }

            // Chronological sort
            seriesForTrend = seriesForTrend.slice().sort((a, b) => {
              const da = parseLocalISO(a?.date ?? a?.week ?? a?.dateStr);
              const db = parseLocalISO(b?.date ?? b?.week ?? b?.dateStr);
              if (da && db) return da - db;
              if (
                a?.dayOfSeason != null &&
                b?.dayOfSeason != null
              ) {
                return Number(a.dayOfSeason) - Number(b.dayOfSeason);
              }
              return 0;
            });

            // Compute WoW trend using SAME-SERIES matcher from trendUtils
            const enableTrend = section.trendEnabled !== false;
            let trendObjRaw = null;

            if (enableTrend) {
              // If strict filter yielded < 2 numeric points, fall back to whole pool with options.
              const poolForPair =
                seriesForTrend?.length >= 2 ? seriesForTrend : trendData;

              console.log(`[TREND] Computing from pool of ${poolForPair.length} rows`);

              const pair = getLastTwoValuesSameSeries(poolForPair, "value", {
                metricKey: "metric",
                submetricKey: "submetric",
                metricOnly: dataType === "ed", // ED: match on metric only
                forceTotal:
                  dataType !== "ed", // LAB/CASES/DEATHS: prefer totals
                totalValues: totalNames,
              });

              if (pair) {
                const [curr, prev] = pair;
                console.log(`[TREND] Found pair: current=${curr}, previous=${prev}`);
                
                if (prev === 0) {
                  trendObjRaw =
                    curr === 0
                      ? { label: "not changed", value: "0%", direction: "same" }
                      : { label: "increased", value: "", direction: "up" };
                } else {
                  const pct = ((curr - prev) / prev) * 100;
                  if (Math.abs(pct) < EPSILON_NO_CHANGE) {
                    trendObjRaw = {
                      label: "not changed",
                      value: "0%",
                      direction: "same",
                    };
                  } else {
                    const rounded = Math.round(pct);
                    trendObjRaw = {
                      label: rounded > 0 ? "increased" : "decreased",
                      value: `${Math.abs(rounded)}%`,
                      direction: rounded > 0 ? "up" : "down",
                    };
                  }
                }
                console.log(`[TREND] Computed trend:`, trendObjRaw);
              } else {
                console.warn(`[TREND] Could not find valid pair for trend calculation`);
              }
            }

            const trendObj = coerceNoChange(trendObjRaw);

            // Trend display helpers (direction text etc. are optional for TrendSubtitle)
            const metricLabelForInfo = resolveMetricLabel({ dataType, view });
            const trendInfo = getTrendInfo({
              trendDirection: trendObj?.direction,
              metricLabel: metricLabelForInfo,
              virus: activeVirus,
            });

            const latestWeek = getLatestWeekFromData(workingData);
            const isFirstWeek = isFirstWeekFromData(workingData);

            const groupLabelText =
              normalizedGroup && normalizedGroup !== normalizedLabel
                ? `in ${groupDisplay}`
                : `across ${normalizedLabel.toLowerCase()}`;

            const trendText = trendObj
              ? formatTrendPhrase(trendObj)
              : "not available";

            const fullVars = {
              ...textVars,
              date: `<span class="bg-highlight">${formatDate(
                latestWeek
              )}</span>`,
              trend: trendText,
              group: groupLabelText,
              trendDirection: trendObj?.direction || "same",
              arrow: trendInfo?.arrow,
              viewLabel: metricLabelForInfo,
              viewLabelPreposition: viewDisplayLabelsPreposition[view],
              virusLabelArticle: virusDisplayLabelsArticle[activeVirus],
              virusLowercase: virusLowercaseDisplay[activeVirus],
              directionText: trendInfo?.directionText,
              trendColor: trendInfo?.trendColor,
            };

            const rawSubtitleTemplate = resolveText(section.subtitle);

            const computedSubtitle = isFirstWeek && dataType !== "death" ? null : (
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

            // Resolve chart component and props
            const ChartComponent = chartRegistry[section.chart?.type];
            if (!ChartComponent) {
              console.warn(`Chart type '${section.chart?.type}' not found`);
              return null;
            }

            const resolvedProps = {
              ...interpolatedProps,
              data: workingData,
              virus: activeVirus,
              view,
              colorMap: tokens.colorScales?.[(activeVirus || "").toLowerCase()],
              tooltip: true,
            };

            // Sensible x mapping for line charts
            if (
              section.chart?.type?.toLowerCase().includes("line") &&
              !resolvedProps.xField
            ) {
              resolvedProps.xField = "date";
            }

            // Filename category: prefer selected group
            const categoryForFile =
              normalizedGroup && normalizedGroup !== normalizedLabel
                ? normalizedGroup
                : section.id || "chart";

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
                  const flattened = Array.isArray(workingData)
                    ? workingData
                    : Object.entries(workingData || {}).flatMap(
                        ([seriesName, rows]) =>
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
                      metric: metricForFile,
                      category: categoryForFile,
                      date: latestDate,
                      ext: "csv",
                      includeMetric:
                        !(dataType === "cases" || dataType === "deaths"),
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
                previewData={workingData}
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
                  altTableData={workingData}
                  altTableVariables={fullVars}
                  altTableColumns={section.chart?.altTable?.columns}
                  altTableCaption={
                    section.chart?.altTable?.caption ||
                    resolveText(section.title, fullVars)
                  }
                  altTableSrOnly={section.chart?.altTable?.srOnly ?? true}
                  disableAltTable={section.disableAltTable} 
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