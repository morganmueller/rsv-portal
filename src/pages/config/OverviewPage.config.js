const overviewConfig = {
  id: "overviewPage",
  titleKey: "overview.title",
  subtitleKey: "overview.subtitle",

  controls: {
    viewToggle: true, 
    virusToggle: false,
  },
  showTopControls: false,

  sections: [
    {      
      id: "stat-cards",
      renderAs: "custom",
      component: "StatGrid",
      background: "white"
    },
    {
      id: "monthly-ari-overview",
      title: "overview.charts.monthlyARIChart.title",
      subtitle: "overview.charts.monthlyARIChart.subtitle",
      trendEnabled: true,
      infoIcon: true,
      showSidebarToggle: true, 
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "ARI Visits",
        markdownPath: "/content/modals/metric-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "ariMonthly",
          xField: "week",
          yField: "{view}", // will be "visits" or "admits"
          tooltipFields: ["week", "visits", "admits"],
          color: "orangePrimary"


        },
        footer: "Source: NYC Health Department Syndromic Surveillance",
      },
      
    },
    {
      id: "overview-info-grid",
      renderAs: "custom",
      component: "OverviewGrid",
      background: "transparent"

    },
  ],

  data: {
    ariMonthly: [
      { week: "2025-01-01", visits: 12456, admits: 4800 },
      { week: "2025-01-08", visits: 11789, admits: 4400 },
      { week: "2025-01-15", visits: 13210, admits: 5100 },
      { week: "2025-01-22", visits: 14032, admits: 5800 },
      { week: "2025-01-29", visits: 19044, admits: 6100 },
      { week: "2025-02-05", visits: 19500, admits: 5900 },
      { week: "2025-02-12", visits: 18800, admits: 5600 },
      { week: "2025-02-19", visits: 18120, admits: 5400 },
      { week: "2025-02-26", visits: 17300, admits: 5200 },
      { week: "2025-03-05", visits: 16540, admits: 4900 },
      { week: "2025-03-12", visits: 15980, admits: 4600 },
      { week: "2025-03-19", visits: 15300, admits: 4300 },
    ],
    
  },
};

export default overviewConfig;
