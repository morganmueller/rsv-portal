const edPageConfig = {
  id: "emergencyDeptPage",
  titleKey: "emergencyDeptPage.mainTitle",
  subtitleKey: "emergencyDeptPage.mainSubtitle",
  dataPath: "/data/emergencyDeptData.csv",

  controls: {
    dataTypeToggle: true,
    virusToggle: false,
    viewToggle: true,
  },

  defaultView: "visits",

  summary: {
    markdownPath: "/content/sections/edSectionText.md",
    title: "Page Overview",
    lastUpdated: "05/01/2025",
    showTrendArrow: false,
    showSecondaryTitle: false,
  },

  sections: [
    // --- Seasonal ED trends (Overall) ---
    {
      id: "ed-trends",
      dataType: "ed",
      title: "emergencyDeptPage.charts.seasonalEdVisits.title",
      subtitle: "emergencyDeptPage.charts.seasonalEdVisits.subtitle",
      trendEnabled: true,
      infoIcon: false,
      downloadIcon: true,
      modal: {
        title: "emergencyDeptPage.charts.seasonalEdVisits.title",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "seasonalEDTrends",
          dataSource: null,
          footnote: null,
          seasonal: null,
          legend: null,
          getMetricNames: ({ virus, view }) => [`${virus} ${view}`],
          submetric: "Overall",
          xField: "date",
          yField: "value",
          colorField: "metric",
          tooltipFields: ["date", "value"],
          columnLabels: {
            date: "Date",
            value: "Emergency department {view}",
          },
        },
        // Accessible alt table
        altTable: {
          caption:
            "Percent of all {view} {viewLabelPreposition} the Emergency Department that have {virusLabelArticle} {virusLowercase} diagnosis (Overall)",
          srOnly: true,
          columns: [
            { key: "date", header: "Week Ending", format: "date" },
            { key: "value", header: "Percent of ED {view}", format: "percent" },
          ],
        },
      },
    },

    // --- ED by Age ---
    {
      id: "percent-ed-visits-age",
      dataType: "ed",
      title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
      subtitle: null,
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title:
          "{viewLabel} {viewLabelPreposition} the Emergency Department That Have {virusLabelArticle} {virus} Diagnosis by Age Group",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "edByAge",
          dataSource: null,
          footnote: null,
          seasonal: null,
          metricName: "{virus} {view} by age group",
          groupField: "submetric",
          groupLabel: "All Ages",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          columnLabels: {
            date: "Date",
            value: "Emergency department {view}",
            submetric: "Age Group",
          },
        },
        // Accessible alt table
        altTable: {
          caption:
            "Percent of ED {view} with {virusLowercase} diagnosis by age group",
          srOnly: true,
          columns: [
            { key: "date", header: "Week Ending", format: "date" },
            { key: "submetric", header: "Age Group", format: "text" },
            { key: "value", header: "Percent of ED {view}", format: "percent" },
          ],
        },
      },
    },

    // --- ED by Borough ---
    {
      id: "percent-ed-visits-geo",
      dataType: "ed",
      title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
      subtitle: null,
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title:
          "{viewLabel} {viewLabelPreposition} the Emergency Department That Have {virusLabelArticle} {virus} Diagnosis by Borough",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "edByGeo",
          dataSource: null,
          footnote: null,
          seasonal: null,
          metricName: "{virus} {view} by borough",
          groupField: "submetric",
          groupLabel: "All Boroughs",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          columnLabels: {
            date: "Date",
            value: "Emergency Department {view}",
            submetric: "Borough",
          },
        },
        // Accessible alt table
        altTable: {
          caption:
            "Percent of ED {view} with {virusLowercase} diagnosis by borough",
          srOnly: true,
          columns: [
            { key: "date", header: "Week Ending", format: "date" },
            { key: "submetric", header: "Borough", format: "text" },
            { key: "value", header: "Percent of ED {view}", format: "percent" },
          ],
        },
      },
    },

    // --- RE Info Summary ---
    {
      id: "ed-info-re",
      renderAs: "custom",
      dataType: "ed",
      dataSourceKey: "emergencyDeptData",
      // title: "emergencyDeptPage.noRaceEthnicitySection.title",
      textKey: "emergencyDeptPage.noRaceEthnicitySection.body", 
      infoIcon: false,
      wrapInChart: false,
      downloadIcon: false,
      animateOnScroll: true,
      background: "transparent"

    },
  ],
};

export default edPageConfig;
