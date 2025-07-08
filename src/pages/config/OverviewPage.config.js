const overviewConfig = {
  id: "overviewPage",
  titleKey: "overview.title",
  subtitleKey: "overview.subtitle",
  dataPath: "/data/emergencyDeptData.csv",


  controls: {
    viewToggle: true, 
    virusToggle: false,
  },
  showTopControls: false,
  showPillToggle: false, 

  sections: [
   {
  id: "stat-cards",
  renderAs: "custom",
  component: "StatGrid",
  
  background: "white",
  dataSourceKey: "statCardData",
  chart: {
    props: {
      metrics: [
        "ARI visits", "ARI hospitalizations",
        "COVID-19 visits", "COVID-19 hospitalizations",
        "Influenza visits", "Influenza hospitalizations",
        "RSV visits", "RSV hospitalizations"
      ],
      submetric: "Overall",
      display: "Percent",

    }
  }
}
,
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
        title: "Respiratory Illness Overview",
        markdownPath: "/content/modals/metric-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalARI",
          dataSource: "NYC Health Department", 
          metricName: "ARI {view}",
          seasonal: null,
          submetric: "Overall", // explicitly set for non-grouped
          xField: "date",
          yField: "value",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Percent", 
          color: "orangePrimary",
          columnLabels: {
            date: "Week",
            value: "Number of {view}",
          }


        },
        // footer: "Source: NYC Health Department Syndromic Surveillance",
      },
      
    },
    {
      id: "overview-info-grid",
      renderAs: "custom",
      component: "OverviewGrid",
      background: "transparent"

    },
  ],

};

export default overviewConfig;
