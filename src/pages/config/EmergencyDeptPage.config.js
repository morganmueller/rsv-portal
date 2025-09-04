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
    {
      id: "ed-trends",
      dataType: "ed",
      title: "emergencyDeptPage.charts.seasonalEdVisits.title",
      subtitle: "emergencyDeptPage.charts.seasonalEdVisits.subtitle",
      trendEnabled: true,
      infoIcon: true,
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
          // title:
          //   "Percent of all {view} {viewLabelPreposition} the emergency department that have {virusLabelArticle} {virusLowercase} diagnosis",
          getMetricNames: ({ virus, view }) => [`${virus} ${view}`, `ARI ${view}`],
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
      },
    },

    {
      id: "percent-ed-visits-age",
      dataType: "ed",
      title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
      subtitle: null,
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
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
          // title:
          //   "Percent of all {view} {viewLabelPreposition} the emergency department that have {virusLabelArticle} {virusLowercase} diagnosis by age group",
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
      },
    },

    {
      id: "percent-ed-visits-geo",
      dataType: "ed",
      title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
      subtitle: null,
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "edByGeo",
          dataSource: null,
          footnote: null,
          // title:
          //   "Percent of all {view} {viewLabelPreposition} the emergency department that have {virusLabelArticle} {virusLowercase} diagnosis by borough",
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
      },
    },
  ],
};

export default edPageConfig;