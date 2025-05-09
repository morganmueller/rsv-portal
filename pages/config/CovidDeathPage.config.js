const covidDeathPageConfig = {
    id: "covidDeathPage",
    titleKey: "CovidDeathPage.mainTitle",
    subtitleKey: "CovidDeathPage.mainSubtitle",
    controls: {
      virusToggle: false, // Only virus toggle shown (no viewToggle)
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
        id: "case-reports-season",
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
          type: "edSeasonalComparisonChart",
          props: {
            dataSourceKey: "seasonalEDData",
            virus: "{virus}",
          },
          footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "case-reports-test-type",
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
          type: "edSeasonalComparisonChart",
          props: {
            dataSourceKey: "seasonalEDData",
            virus: "{virus}",
          },
          footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "case-reports-age",
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
          type: "edSeasonalComparisonChart",
          props: {
            dataSourceKey: "seasonalEDData",
            virus: "{virus}",
          },
          footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      },
      {
        id: "case-reports-borough",
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
          type: "edSeasonalComparisonChart",
          props: {
            dataSourceKey: "seasonalEDData",
            virus: "{virus}",
          },
          footer: "Source: NYC Health Department Syndromic Surveillance",
        },
      }
    ],
    data: {
      seasonalEDData: [
        { week: "1", season: "2021-22", visits: 3400 },
        { week: "1", season: "2022-23", visits: 4000 },
        { week: "1", season: "2023-24", visits: 4200 },
        { week: "1", season: "2024-25", visits: 4600 },
        { week: "2", season: "2021-22", visits: 3900 },
        { week: "2", season: "2022-23", visits: 4400 },
        { week: "2", season: "2023-24", visits: 4700 },
        { week: "2", season: "2024-25", visits: 5100 },
      ],
    },
  };
  
  export default covidDeathPageConfig;
  