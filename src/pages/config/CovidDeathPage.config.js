const covidDeathPageConfig = {
  id: "covidDeathPage",
  titleKey: "covidDeathPage.mainTitle",
  subtitleKey: "covidDeathPage.mainSubtitle",
  dataPath: "/data/deathData.csv",

  controls: {
    dataTypeToggle: true,
    virusToggle: false,
    viewToggle: false,
  },

  summary: {
    title: "Covid Death Page Overview",
    markdownPath: "/content/sections/covidDeathSectionText.md",
    lastUpdated: "05/01/2025",
    showTrendArrow: false,
    showSecondayTitle: false,
    metricLabel: "cases", // Used when no viewToggle
  },

  sections: [
    {
      id: "deaths-season",
      dataType: "death",
      title: "covidDeathPage.charts.seasonalComparison.title",
      subtitle: "covidDeathPage.charts.seasonalComparison.subtitle",
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Deaths by Season",
        markdownPath: "/content/modals/covid-deaths-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalCovidDeaths",
          dataSource: null,
          seasonal: true,
          metricName: "{virus} deaths",
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
            value: "Deaths",
          },
        },
        // Accessible alt table
        altTable: {
          caption: "{virus} deaths by season",
          srOnly: true,
          columns: [
            { key: "date",   header: "Date",   format: "date" },
            { key: "season", header: "Season", format: "text" },
            { key: "value",  header: "Deaths", format: "number" },
          ],
        },
      },
    },

    {
      id: "deaths-age-group",
      dataType: "death",
      title: "covidDeathPage.charts.deathsByAge.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Deaths by Age Group",
        markdownPath: "/content/modals/covid-deaths-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "covidDeathsByAge",
          dataSource: null,
          seasonal: null,
          footnote:
            "Y-axis scales are different to clearly show trends for a given age group.",
          metricName: "{virus} deaths by age group",
          groupedAges: true,
          monthly: true,
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Age Group",
          },
        },
        altTable: {
          caption: "{virus} deaths by age group",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",      format: "date" },
            { key: "submetric", header: "Age Group", format: "text" },
            { key: "value",     header: "Deaths",    format: "number" },
          ],
        },
      },
    },

    {
      id: "deaths-borough",
      dataType: "death",
      title: "covidDeathPage.charts.deathsByBorough.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Deaths by Borough",
        markdownPath: "/content/modals/covid-deaths-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "covidDeathsByGeo",
          dataSource: null,
          seasonal: null,
          footnote:
            "Y-axis scales are different to clearly show trends for a given borough.",
          metricName: "{virus} deaths by borough",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number",
          monthly: true,
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Borough",
          },
        },
        altTable: {
          caption: "{virus} deaths by borough",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",    format: "date" },
            { key: "submetric", header: "Borough", format: "text" },
            { key: "value",     header: "Deaths",  format: "number" },
          ],
        },
      },
    },

    {
      id: "deaths-re",
      dataType: "death",
      title: "covidDeathPage.charts.deathsByRE.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Deaths by Race and Ethnicity",
        markdownPath: "/content/modals/covid-deaths-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "covidDeathsByRE",
          dataSource: null,
          seasonal: null,
          footnote:
            "Y-axis scales are different to clearly show trends for a given ethnicity.",
          metricName: "{virus} deaths by race and ethnicity",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number",
          monthly: true,
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Race & Ethnicity",
          },
        },
        altTable: {
          caption: "{virus} deaths by race & ethnicity",
          srOnly: true,
          columns: [
            { key: "date",      header: "Date",               format: "date" },
            { key: "submetric", header: "Race & Ethnicity",   format: "text" },
            { key: "value",     header: "Deaths",             format: "number" },
          ],
        },
      },
    },
  ],
};

export default covidDeathPageConfig;
