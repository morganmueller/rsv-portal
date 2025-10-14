const caseDataPageConfig = {
  id: "caseDataPage",
  titleKey: "caseDataPage.mainTitle",
  subtitleKey: "caseDataPage.mainSubtitle",
  dataPath: "/data/caseData.csv",
  dataType: "lab",

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
    bullets: [
      {
        id: "flu-peds-deaths",
        renderAs: "custom",
        component: "SeasonalBullet",
        dataSourceKey: "deathData",
        componentProps: {
          dataPath: "/data/deathData.csv",
          diseaseLabel: "Pediatric flu deaths",
          season: { start: { month: 10, day: 4 }, end: { month: 5, day: 31 } },
          filters: { metric: "Pediatric influenza deaths", submetric: "Seasonal 2025-2026" },
          weeklyField: "value",
          seasonalSubmetric: "Seasonal 2025-2026",
          dateField: "date",
          showWhen: ({ virus, dataType }) => virus === "Flu" && dataType === "lab",
          as: "p",
          className: "seasonal-bullet",
        },
      },
    ],
    metricLabel: "cases",
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
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalCaseTrends",
          dataSource: null,
          seasonal: true,
          metricName: "{virus} cases",
          submetric: "Total",
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
          },
        },
        altTable: {
          caption: "{virus} confirmed cases by season",
          srOnly: true,
          columns: [
            { key: "date",   header: "Date",            format: "date" },
            { key: "season", header: "Season",          format: "text" },
            { key: "value",  header: "Confirmed cases", format: "number" },
          ],
        },
      },
    },

    {
      id: "case-reports-test-type",
      dataType: "lab",
      title: "caseDataPage.charts.reportsByTestType.title",
      subtitle: null,
      showIfVirus: "COVID-19",
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
          groupField: "submetric",
          field: "isoWeek",
          yField: "value",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          showRollingAvg: false,
          customColorScale: {
            domain: ["Confirmed", "Probable"],
            range: ["#08519C", "#9CA3AF"],
          },
          columnLabels: {
            date: "Date",
            value: "Cases",
            // submetric: "Test Type",
          },
        },
        altTable: {
          caption: "{virus} cases by test type",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",       format: "date" },
            { key: "submetric", header: "Test Type",  format: "text" },
            { key: "value",     header: "Cases",      format: "number" },
          ],
        },
      },
    },

    {
      id: "case-reports-subtype",
      dataType: "lab",
      title: "caseDataPage.charts.reportsBySubtype.title",
      subtitle: null,
      showIfVirus: "Flu",
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true,
      animateOnScroll: true,
      modal: {
        title: "caseDataPage.charts.reportsBySubtype.title",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "yearComparisonChart",
        props: {
          dataSourceKey: "casesBySubType",
          dataSource: null,
          metricName: "{virus} cases by subtype",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number",
          showRollingAvg: false,
          customColorScale: {
            domain: ["Influenza A not subtyped", "Influenza A H1", "Influenza A H3", "Influenza B"],
            range: ["#3F007D", "#6A51A3", "#807DBA", "#9E9AC8"],
          },
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Subtype",
          },
        },
        altTable: {
          caption: "{virus} confirmed cases by subtype",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",            format: "date" },
            { key: "submetric", header: "Subtype",         format: "text" },
            { key: "value",     header: "Confirmed cases", format: "number" },
          ],
        },
      },
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
          footnote: "Y-axis scales are different to clearly show trends for a given age group.",
          seasonal: null,
          metricName: "{virus} cases by age group",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          customColor: "#4F32B3",
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Age Group",
          },
        },
        altTable: {
          caption: "{virus} confirmed cases by age group",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",            format: "date" },
            { key: "submetric", header: "Age Group",       format: "text" },
            { key: "value",     header: "Confirmed cases", format: "number" },
          ],
        },
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
          footnote: "Y-axis scales are different to clearly show trends for a given borough.",
          metricName: "{virus} cases by borough",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Borough",
          },
        },
        altTable: {
          caption: "{virus} confirmed cases by borough",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",            format: "date" },
            { key: "submetric", header: "Borough",         format: "text" },
            { key: "value",     header: "Confirmed cases", format: "number" },
          ],
        },
      },
    },

    {
      id: "case-reports-re",
      dataType: "lab",
      title: "caseDataPage.charts.reportsByRE.title",
      subtitle: null,
      showIfVirus: "COVID-19",
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
          footnote: "Y-axis scales are different to clearly show trends for a given race and ethnicity.",
          metricName: "{virus} cases by race and ethnicity",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          columnLabels: {
            date: "Date",
            value: "Confirmed cases",
            submetric: "Race & Ethnicity",
          },
        },
        altTable: {
          caption: "{virus} confirmed cases by race and ethnicity",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",                 format: "date" },
            { key: "submetric", header: "Race & Ethnicity",     format: "text" },
            { key: "value",     header: "Confirmed cases",      format: "number" },
          ],
        },
      },
    },
    {
      id: "case-info-flu-re",
      dataType: "lab",
      renderAs: "custom",
      // title: "caseDataPage.noRaceEthnicitySection.title",
      textKey: "caseDataPage.noRaceEthnicitySection.body", 
      showIfVirus: "Flu",
      infoIcon: false,
      downloadIcon: false,
      animateOnScroll: true,
      background: "transparent"

    },

    {
      id: "case-info-rsv-re",
      dataType: "lab",
      renderAs: "custom",
      dataSourceKey: "casesByAge",
      wrapInChart: false,
      // title: "caseDataPage.noRaceEthnicitySection.title",
      textKey: "caseDataPage.noRaceEthnicitySection.body", 
      showIfVirus: "RSV",
      infoIcon: false,
      downloadIcon: false,
      animateOnScroll: true,
      background: "transparent"

    },

    
  ],
};

export default caseDataPageConfig;
