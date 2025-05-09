const caseDataPageConfig = {
    id: "caseDataPage",
    titleKey: "caseDataPage.mainTitle",
    subtitleKey: "caseDataPage.mainSubtitle",
    controls: {
      virusToggle: true, // Only virus toggle shown (no viewToggle)
    },
    summary: {
      title: "Page Overview",
      markdownPath: "/content/sections/caseDataSectionText.md",
      lastUpdated: "05/01/2025",
      showTrendArrow: true,
      showSecondayTitle: false,

      metricLabel: "cases", // Used when no viewToggle
    },
    sections: [
      {
        id: "case-reports-season",
        title: "caseDataPage.charts.seasonalComparison.title",
        subtitle: "caseDataPage.charts.seasonalComparison.subtitle",
        infoIcon: true,
        downloadIcon: true,
        trendEnabled: true, 
        animateOnScroll: true,
        modal: {
          title: "{virus} Laboratory Reports by Season",
          markdownPath: "/content/modals/cases-explainer.md"
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
        title: "caseDataPage.charts.reportsByTestType.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "{virus} Laboratory Reports by Test Type",
          markdownPath: "/content/modals/cases-explainer.md",
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
        title: "caseDataPage.charts.reportsByAge.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "{virus} Laboratory Reports by Age Group",
          markdownPath: "/content/modals/cases-explainer.md",
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
        title: "caseDataPage.charts.reportsByBorough.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "{virus} Laboratory Reports by Borough",
          markdownPath: "/content/modals/cases-explainer.md",
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
        id: "case-reports-re",
        title: "caseDataPage.charts.reportsByRE.title",
        // subtitle: "Cases for {virus} are {trend} this week than last week.",
        infoIcon: true,
        downloadIcon: true,
        animateOnScroll: true,
        modal: {
          title: "{virus} Laboratory Reports by Race and Ethnicity",
          markdownPath: "/content/modals/cases-explainer.md",
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
  
  export default caseDataPageConfig;
  