const edPageConfig = {
  id: "emergencyDeptPage",
  titleKey: "emergencyDeptPage.mainTitle",
  subtitleKey: "emergencyDeptPage.mainSubtitle",
  dataPath: "/data/emergencyDeptData.csv",

  controls: {
    virusToggle: true,
    viewToggle: true,
  },
  
  defaultView: "visits",

  summary: {
    markdownPath: "/content/sections/edSectionText.md",
    title: "Page Overview",
    lastUpdated: "05/01/2025",
    showTrendArrow: true,
    showSecondaryTitle: false,
  },

  sections: [
    {
      id: "ed-trends",
      title: "emergencyDeptPage.charts.seasonalEdVisits.title",
      subtitle: "emergencyDeptPage.charts.seasonalEdVisits.subtitle",
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} Seasonal ED {view}",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalEDTrends",
          metricName: "{virus} {view}",
          submetric: "Overall", // ✅ explicitly set for non-grouped
          xField: "date",
          yField: "value",
          colorField: null,
          tooltipFields: ["date", "value"],
          columnLabels: {
            date: "Week",
            value: "Number of {view}",
          }
        }
      }
    },

    {
      id: "percent-ed-visits-age",
      title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
      subtitle: "emergencyDeptPage.charts.percentEdVisitsByAge.subtitle",
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} ED {view} by Age Group",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "edByAge",
          metricName: "{virus} {view} by age group",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          columnLabels: {
            date: "Week",
            value: "Number of {view}",
            submetric: "Age Group"
          }
        }
      }
    },

    {
      id: "percent-ed-visits-geo",
      title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
      subtitle: "emergencyDeptPage.charts.percentEdVisitsByGeo.subtitle",
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} ED {view} by Borough",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "edByGeo",
          metricName: "{virus} {view} by borough",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          columnLabels: {
            date: "Week",
            value: "Number of {view}",
            submetric: "Borough" 
          }
        }
      }
    }
  ]
};

export default edPageConfig;
