const covidDeathPageConfig = {
    id: "covidDeathPage",
    titleKey: "CovidDeathPage.mainTitle",
    subtitleKey: "CovidDeathPage.mainSubtitle",
    dataPath: "/data/covidDeathData.csv",

    controls: {
      virusToggle: false, 
      viewToggle: false,
    },
    summary: {
      title: "Covid Death Page Overview",
      markdownPath: "/content/sections/covidDeathSectionText.md",
      lastUpdated: "05/01/2025",
      showTrendArrow: true,
      showSecondayTitle: false,

      metricLabel: "cases", // Used when no viewToggle
    },
    sections: [
      {
        id: "covid-deaths-season",
        title: "CovidDeathPage.charts.seasonalComparison.title",
        subtitle: "CovidDeathPage.charts.seasonalComparison.subtitle",
        infoIcon: true,
        downloadIcon: true,
        trendEnabled: true, 
        animateOnScroll: true,
        modal: {
          title: "COVID-19 Deaths by Season",
          markdownPath: "/content/modals/covid-deaths-explainer.md",
        },
        chart: {
          type: "lineChart",
          props: {
            dataSourceKey: "seasonalCovidDeaths",
            dataSource: "NYC Health Department", 
            seasonal: true,
            metricName: "{virus} deaths",
            submetric: "Total", // explicitly set for non-grouped
            xField: "date",
            yField: "value",
            colorField: null,
            tooltipFields: ["date", "value"],
            defaultDisplay: "Number", 
            columnLabels: {
              date: "Week",
              value: "Number of Deaths",
            }
  
          }
          // footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "covid-deaths-age-group",
        title: "CovidDeathPage.charts.deathsByAge.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "COVID-19 Deaths by Age Group",
          markdownPath: "/content/modals/covid-deaths-explainer.md",
        },
        chart: {
          type: "lineChart",
          props: {
            dataSourceKey: "covidDeathsByAge",
            dataSource: "NYC Health Department", 
            seasonal: null,
            metricName: "{virus} deaths by age group",
            groupField: "submetric", // explicitly set for non-grouped
            xField: "date",
            yField: "value",
            colorField: null,
            tooltipFields: ["date", "value"],
            defaultDisplay: "Number", 
            columnLabels: {
              date: "Week",
              value: "Number of Deaths",
              submtric: "Age Group"
            }
  
          }
          // footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "covid-deaths-borough",
        title: "CovidDeathPage.charts.deathsByBorough.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "COVID-19 Deaths by Borough",
          markdownPath: "/content/modals/covid-deaths-explainer.md",
        },
        chart: {
          type: "lineChart",
          props: {
            dataSourceKey: "covidDeathsByGeo",
            dataSource: "NYC Health Department", 
            seasonal: null,
            metricName: "{virus} deaths by borough",
            groupField: "submetric", // explicitly set for non-grouped
            xField: "date",
            yField: "value",
            colorField: null,
            tooltipFields: ["date", "value"],
            defaultDisplay: "Number", 
            columnLabels: {
              date: "Week",
              value: "Number of Deaths",
              submtric: "Borough"
            }
          }
          // footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "covid-deahths-re",
        title: "CovidDeathPage.charts.deathsByRE.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "COVID-19 Deaths by Race & Ethnicity",
          markdownPath: "/content/modals/covid-deaths-explainer.md",
        },
        chart: {
          type: "lineChart",
          props: {
            dataSourceKey: "covidDeathsByRE",
            dataSource: "NYC Health Department", 
            seasonal: null,
            metricName: "{virus} deaths by race and ethnicity",
            groupField: "submetric", 
            xField: "date",
            yField: "value",
            colorField: null,
            tooltipFields: ["date", "value"],
            defaultDisplay: "Number", 
            columnLabels: {
              date: "Week",
              value: "Number of Deaths",
              submtric: "Race & Ethnicity"
            }
          }
        },
      }
    ],
  };
  
  export default covidDeathPageConfig;
  