

const edPageConfig = {
  id: "emergencyDeptPage",
  titleKey: "emergencyDeptPage.mainTitle",
  subtitleKey: "emergencyDeptPage.mainSubtitle",
  controls: {
    virusToggle: true,
    viewToggle: true,
  },
  summary: {
    markdownPath: "/content/sections/edSectionText.md",
    title: "Page Overview",
    lastUpdated: "05/01/2025",
    showTrendArrow: true,
    showSecondayTitle: false,
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
        type: "edSeasonalComparisonChart", // or change to "simpleEDChart" if you rename it
        props: {
          dataSourceKey: "seasonalEDData", // ✅ now a flat list of recent weeks
          virus: "{virus}",
          view: "{view}" // pass this so the chart knows to render "visits" or "admits"
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
      
    },

    {
      id: "percent-ed-visits-age",
      title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
      // subtitle: "emergencyDeptPage.charts.seasonalEdVisits.subtitle",
      trendEnabled: true, 
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} ED {view} by Age Group",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "edSeasonalComparisonChart", // or change to "simpleEDChart" if you rename it
        props: {
          dataSourceKey: "seasonalEDData", // ✅ now a flat list of recent weeks
          virus: "{virus}",
          view: "{view}" // pass this so the chart knows to render "visits" or "admits"
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
      
    },

    {
      id: "percent-ed-visits-geo",
      title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
      // subtitle: "emergencyDeptPage.charts.seasonalEdVisits.subtitle",
      trendEnabled: true, 
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: " {virus} ED {view} by Borough",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "edSeasonalComparisonChart", // or change to "simpleEDChart" if you rename it
        props: {
          dataSourceKey: "seasonalEDData", // ✅ now a flat list of recent weeks
          virus: "{virus}",
          view: "{view}" // pass this so the chart knows to render "visits" or "admits"
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
      
    },
    
  ],
  data: {
    seasonalEDData: [
      { week: "2025-04-01", visits: 12000, admits: 3000 },
      { week: "2025-04-08", visits: 12500, admits: 3100 },
      { week: "2025-04-15", visits: 13000, admits: 3200 },
      { week: "2025-04-22", visits: 14000, admits: 3500 },
      { week: "2025-04-29", visits: 15000, admits: 3700 }
    ]
  }
  
  
  
};

export default edPageConfig;
  