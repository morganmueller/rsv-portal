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
    showTrendArrow: false,
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
        title: "Emergency Department {viewLabel}",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "seasonalEDTrends",
          dataSource: "[NYC Health Department Syndromic Surveillance](https://www.nyc.gov/)",
          footnote: "*Data includes only hospitals that report syndromic data consistently.*",
          seasonal: null,
          title: "Percent of All {viewLabel} {viewLabelPreposition} the Emergency Department That Have a {virus} Diagnosis",
          metricName: "{virus} {view}",
          submetric: "Overall",
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
        title: "Emergency Department {viewLabel}",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "edByAge",
          dataSource: "[NYC Health Department Syndromic Surveillance](https://www.nyc.gov/)",
          footnote: "*Age groups are based on patient-reported data and may contain missing values.*",
          seasonal: null,
          title: "Percent of All {viewLabel} {viewLabelPreposition} the Emergency Department That Have a {virus} Diagnosis, by Age Group",
          metricName: "{virus} {view} by age group",
          groupField: "submetric",
          groupLabel: "All Ages",
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
        title: "Emergency Department {viewLabel}",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          isPercent: true,
          dataSourceKey: "edByGeo",
          dataSource: "[NYC Health Department Syndromic Surveillance](https://www.nyc.gov/)",
          footnote: "*Borough-level data reflects patient residence, not facility location.*",
          title: "Percent of All {viewLabel} {viewLabelPreposition} the Emergency Department That Have a {virus} Diagnosis, by Borough",
          seasonal: null,
          metricName: "{virus} {view} by borough",
          groupField: "submetric",
          groupLabel: "All Boroughs",
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
