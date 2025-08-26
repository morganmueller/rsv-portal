
const caseDataPageConfig = {
  id: "caseDataPage",
  titleKey: "caseDataPage.mainTitle",
  subtitleKey: "caseDataPage.mainSubtitle",
  dataPath:  "/data/caseData.csv",

  controls: {
    dataTypeToggle: true,
    virusToggle: false, 
    viewToggle: false,
  },

  summary: {
    title: "Page Overview",
    markdownPath: "/content/sections/caseDataSectionText.md",
    lastUpdated: "05/01/2025",
    showTrendArrow: false,
    showSecondayTitle: false,

    metricLabel: "cases", // Used when no viewToggle
  },
  sections: [
    {
      id: "case-reports-season",
      dataType: "lab",
      title: "caseDataPage.charts.seasonalComparison.title",
      subtitle: "caseDataPage.charts.seasonalComparison.subtitle",
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true, 
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.seasonalComparison.title",
        markdownPath: "/content/modals/cases-explainer.md"
      },
      chart: {
      type: "lineChart",
      props: {
        dataSourceKey: "seasonalCaseTrends",
        dataSource: null,
        seasonal: true,
        title: "Counts of {virusLowercase} laboratory-reported cases by season",
        metricName: "{virus} cases",
        submetric: "Total", // explicitly set for non-grouped
        xField: "dayOfSeason",
        yField: "value",
        colorField: "season",
        tooltipFields: ["date", "season", "value"],
        defaultDisplay: "Number",
        isPercent: false,   
        columnLabels: {
          date: "Date",
          season: "Season",
          value: "Confirmed cases",
        }
      }
      }
    },
  
    
    {
      id: "case-reports-test-type",
      dataType: "lab",
      title: "caseDataPage.charts.reportsByTestType.title",
      subtitle: null,
      showIfVirus: "COVID-19", 
      // subtitle: "Cases for {virus} are {trend} this week than last week.",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsByTestType.title",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "yearComparisonChart",
        props: {
          dataSourceKey: "casesByType",
          dataSource: null,
          metricName: "{virus} cases by test type",
          title: "Counts of {virusLowercase} laboratory-reported cases by test type",
          groupField: "submetric",
          field: "isoWeek",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number", 
          legendTitle: "Type",
          showRollingAvg: false,
          customColorScale: {
            domain: ["Confirmed", "Probable"],
            range: ["#4F32B3", "#9CA3AF"],
          },
          columnLabels: {
            date: "Date",
            value: "Cases",
            submetric: "Test Type",
          }
        }
      },
    },

    {
      id: "case-reports-subtype",
      dataType: "lab",

      title: "caseDataPage.charts.reportsBySubtype.title",
      subtitle: null,
      showIfVirus: "Influenza", 
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true, 
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsBySubtype.title",
        markdownPath: "/content/modals/cases-explainer.md"
      },
      chart: {
      type: "yearComparisonChart",
      props: {
        dataSourceKey: "casesBySubType",
        dataSource: null,
        // title: "Counts of {virusLowercase} laboratory-reported cases by subtype",
        metricName: "{virus} cases by subtype",
        groupField: "submetric",
        xField: "date",
        yField: "value",
        colorField: "submetric",
        tooltipFields: ["date", "value"],
        defaultDisplay: "Number", 
        legendTitle: "Subtype",
        showRollingAvg: false, 
        customColorScale: {
          domain: ["Influenza A not subtyped", "Influenza A H1", "Influenza A H3", "Influenza B" ],
          range: ["#3F007D", "#6A51A3", "#807DBA", "#9E9AC8"],
        },
        columnLabels: {
          date: "Date",
          value: "Confirmed cases",
          submetric: "Subtype"
        }
      }
      }
    },

    {
      id: "case-reports-age",
      dataType: "lab",

      title: "caseDataPage.charts.reportsByAge.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsByAge.title",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "casesByAge",
          dataSource: null,
          seasonal: null,
          metricName: "{virus} cases by age group",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          // title: "Counts of {virusLowercase} laboratory-reported cases by age group",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number", 
          customColor: '#4F32B3',
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Age Group"
          }

        }
      },
    },
    {
      id: "case-reports-borough",
      dataType: "lab",

      title: "caseDataPage.charts.reportsByBorough.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsByBorough.title",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "casesByBorough",
          dataSource: null,
          seasonal: null,
          metricName: "{virus} cases by borough",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          // title: "Counts of {virusLowercase} laboratory-reported cases by borough",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Borough"
          } 

        }
      },
    },
    {
      id: "case-reports-re",
      dataType: "lab",

      title: "caseDataPage.charts.reportsByRE.title",
      subtitle: null,
      showIfVirus: "COVID-19", 
      // subtitle: "Cases for {virus} are {trend} this week than last week.",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsByRE.title",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "casesByRE",
          dataSource: null,
          seasonal: null,
          metricName: "{virus} cases by race and ethnicity",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          // title: "Counts of {virusLowercase} laboratory-reported cases by race and ethnicity",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number", 
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Race & Ethnicity"
          }

        }
      },
    },
  ],
};

export default caseDataPageConfig;