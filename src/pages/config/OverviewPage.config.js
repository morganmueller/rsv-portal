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
      disableAltTable: true,
      wrapInChart: false,
      chart: {
        props: {
          metrics: [
            "Respiratory illness visits", "Respiratory illness hospitalizations",
            "COVID-19 visits", "COVID-19 hospitalizations",
            "Influenza visits", "Influenza hospitalizations",
            "RSV visits", "RSV hospitalizations"
          ],
          submetric: "Overall",
          display: "Percent",
        }
      }
    },

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
            "Respiratory illness {view}",
            "COVID-19 {view}",
            "Flu {view}",
            "RSV {view}"
          ],
          title: "",
          dataSourceKey: "emergencyDeptData",
          datasource: null,
          seasonal: null,
          submetric: "Overall",
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
        altTable: {
          caption: "Emergency department {view} for ARI and viruses (Overall)",
          srOnly: true,
          columns: [
            { key: "date",   header: "Date",                    format: "date" },
            { key: "series", header: "Series",                  format: "text" },
            // value is 0–100 in the source; force correct scaling to percent:
            { key: "value",  header: "Emergency department {view}", format: "percent", scale: "hundred" }
          ]
        }
      },
    },

    {
      id: "other-resp-paragraph",
      title: "overview.otherResp.title",
      infoIcon: true,
      downloadIcon: true,
      renderAs: "custom",
      component: "DynamicParagraph",
      dataSourceKey: "otherRespData",
      modal: {
        title: "overview.otherResp.title",
        markdownPath: "/content/modals/metric-explainer.md",
      },
      componentProps: {
        textKeyBase: "overview.otherResp",
        display: "Percent",
        dataPath: "/data/emergencyDeptData.csv",
        order: [
          "Adenovirus",
          "Human Coronavirus",
          "SARS-CoV-2",
          "Enterovirus/Rhinovirus",
          "Human Metapneumovirus",
          "Influenza",
          "Parainfluenza",
          "Respiratory Syncytial Virus"
        ]
      },
      animateOnScroll: true,
      background: "white"
    },

    {
      id: "overview-info-grid",
      dataSourceKey: "emergencyDeptData",
      renderAs: "custom",
      wrapInChart: false,
      component: "OverviewGrid",
      background: "transparent"
    },
  ],
};

export default overviewConfig;
