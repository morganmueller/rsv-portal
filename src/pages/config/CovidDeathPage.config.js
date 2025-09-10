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
      id: "covid-deaths-season",
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
          // title: "Counts of {virus} deaths by season",
          seasonal: true,
          metricName: "{virus} deaths",
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
            value: "Deaths",
          }

        }
      },
    },
    {
      id: "covid-deaths-age-group",
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
          // title: "Counts of {virus} deaths by age group",
          seasonal: null,
          footnote: "Y-axis scales are different to clearly show trends for any one age range.",
          metricName: "{virus} deaths by age group",
          groupedAges: true,
          monthly: true,
          groupField: "submetric", // explicitly set for non-grouped
          xField: "date",
          yField: "value",
          // title: "COVID-19 deaths",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Age Group"
          }

        }
      },
    },
    {
      id: "covid-deaths-borough",
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
          // title: "Counts of {virus} deaths by borough",
          seasonal: null,
          footnote: "Y-axis scales are different to clearly show trends for any one borough.",
          metricName: "{virus} deaths by borough",
          groupField: "submetric", // explicitly set for non-grouped
          xField: "date",
          yField: "value",
          // title: "COVID-19 deaths",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number", 
          monthly: true,
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Borough"
          }
        }
      },
    },
    {
      id: "covid-deahths-re",
      dataType: "death",

      title: "covidDeathPage.charts.deathsByRE.title",
      subtitle: null,
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Deaths by Race & Ethnicity",
        markdownPath: "/content/modals/covid-deaths-explainer.md",
      },
      chart: {
        type: "smallMultipleLineChart",
        props: {
          dataSourceKey: "covidDeathsByRE",
          dataSource: null, 
          // title: "Counts of {virus} deaths by race and ethnicity",
          seasonal: null,
          footnote: "Y-axis scales are different to clearly show trends for any one race & ethnicity.",
          metricName: "{virus} deaths by race and ethnicity",
          groupField: "submetric", 
          xField: "date",
          yField: "value",
          // title: "COVID-19 deaths",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number", 
          monthly: true,
          columnLabels: {
            date: "Date",
            value: "Deaths",
            submetric: "Race & Ethnicity"
          }
        }
      },
    }
  ],
};

export default covidDeathPageConfig;
