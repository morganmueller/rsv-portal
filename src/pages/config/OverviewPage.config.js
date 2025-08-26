const overviewConfig = {
  id: "overviewPage",
  titleKey: "overview.title",
  subtitleKey: "overview.subtitle",
  dataPath: "/data/emergencyDeptData.csv",


  controls: {
    viewToggle: true, 
    virusToggle: false,
    dataTypeToggle: false,

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
      id: "combined-virus",
      title: "overview.charts.monthlyARIChart.title",
      renderAs: "custom",         
      component: "CombinedVirusChart",
      subtitle: "overview.charts.monthlyARIChart.subtitle",
      trendEnabled: true,
      infoIcon: true,
      viewToggle: true,
      showSidebarToggle: true, 
      sidebarAboveChart: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "overview.charts.monthlyARIChart.title",
        markdownPath: "/content/modals/metric-explainer.md",
      },
      chart: {
        type: "combinedVirusChart",
        props: {
          metrics: [
            "ARI {view}",
            "COVID-19 {view}",
            "Influenza {view}",
            "RSV {view}"
          ],
          title: "",
          dataSourceKey: "emergencyDeptData",
          datasource: null,
          seasonal: null,
          submetric: "Overall", // explicitly set for non-grouped
          seriesField: "series",
          xField: "date",
          yField: "value",
          tooltipFields: ["date", "value", "series"],
          defaultDisplay: "Percent", 
          color: "orangePrimary",
          columnLabels: {
            date: "Date",
            value: "Emergency department {view}",
            series: "submetric",
          }


        },
      },
      
    },
    {
      id: "other-resp-paragraph",
      title: "overview.otherResp.title",
      infoIcon: true,
      downloadIcon: true,
      renderAs: "custom",
      component: "DynamicParagraph",
      // This key drives what slice of hydrated data the component will get
      dataSourceKey: "otherRespData",
      modal: {
        title: "overview.otherResp.title",
        markdownPath: "/content/modals/metric-explainer.md",
      },
      componentProps: {
        textKeyBase: "overview.otherResp",
        display: "Percent",
        dataPath: "/data/otherRespData.csv",
        order: [
          "Adenovirus",
          "Human Coronavirus",
          "Enterovirus/Rhinovirus",
          "Human Metapneumovirus",
          "Influenza",
          "Parainfluenza",
          "Respiratory Syncytial Virus"
        ]
        // metricName optional here because the hydrator is already filtering by it
        // If you prefer the component to self-load instead, add dataPath and omit dataSourceKey/chart.props.
      },
      animateOnScroll: true,
      background: "white"
    },
    

    {
      id: "overview-info-grid",
      dataSourceKey: "emergencyDeptData",
      renderAs: "custom",
      component: "OverviewGrid",
      background: "transparent"

    },
  ],

};

export default overviewConfig;
