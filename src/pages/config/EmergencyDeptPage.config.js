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
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalEDTrends", // new dynamic object
          xField: "week",
          yField: "{view}",
          colorField: null,
          tooltipFields: ["week", "{view}"]
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
    },

    {
      id: "percent-ed-visits-age",
      title: "emergencyDeptPage.charts.percentEdVisitsByAge.title",
      subtitle: "emergencyDeptPage.charts.percentEdVisitsByAge.subtitle", 
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} ED {view} by Age Group",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "edByAge",
          xField: "week",
          yField: "{view}",
          colorField: "ageGroup",
          tooltipFields: ["week", "ageGroup", "{view}"]
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
    },

    {
      id: "percent-ed-visits-geo",
      title: "emergencyDeptPage.charts.percentEdVisitsByGeo.title",
      subtitle: "emergencyDeptPage.charts.percentEdVisitsByGeo.subtitle",
      trendEnabled: true,
      infoIcon: true,
      downloadIcon: true,
      modal: {
        title: "{virus} ED {view} by Borough",
        markdownPath: "/content/modals/emergency-dept-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "edByGeo",
          xField: "week",
          yField: "{view}",
          colorField: "borough",
          tooltipFields: ["week", "borough", "{view}"]
        },
        footer: "Source: NYC Health Department Syndromic Surveillance"
      }
    }
  ],

  data: {
    seasonalEDTrends: [
      // COVID-19
      { virus: "COVID-19", week: "2025-04-01", visits: 12000, admits: 3000 },
      { virus: "COVID-19", week: "2025-04-08", visits: 12500, admits: 3100 },
      { virus: "COVID-19", week: "2025-04-15", visits: 12750, admits: 3200 },
      { virus: "COVID-19", week: "2025-04-22", visits: 13000, admits: 3300 },
      { virus: "COVID-19", week: "2025-04-29", visits: 12800, admits: 3250 },
  
      // Influenza
      { virus: "Influenza", week: "2025-04-01", visits: 8000, admits: 2000 },
      { virus: "Influenza", week: "2025-04-08", visits: 8300, admits: 2100 },
      { virus: "Influenza", week: "2025-04-15", visits: 8500, admits: 2200 },
      { virus: "Influenza", week: "2025-04-22", visits: 8700, admits: 2250 },
      { virus: "Influenza", week: "2025-04-29", visits: 8600, admits: 2225 },
  
      // RSV
      { virus: "RSV", week: "2025-04-01", visits: 5000, admits: 1500 },
      { virus: "RSV", week: "2025-04-08", visits: 5200, admits: 1600 },
      { virus: "RSV", week: "2025-04-15", visits: 5400, admits: 1650 },
      { virus: "RSV", week: "2025-04-22", visits: 5600, admits: 1700 },
      { virus: "RSV", week: "2025-04-29", visits: 5500, admits: 1680 }
    ],

    edByAge: [
      // COVID-19
      { virus: "COVID-19", week: "2025-04-01", ageGroup: "0-17", visits: 3000, admits: 800 },
      { virus: "COVID-19", week: "2025-04-08", ageGroup: "0-17", visits: 3200, admits: 850 },
      { virus: "COVID-19", week: "2025-04-01", ageGroup: "18-64", visits: 6000, admits: 1500 },
      { virus: "COVID-19", week: "2025-04-08", ageGroup: "18-64", visits: 6300, admits: 1550 },
      { virus: "COVID-19", week: "2025-04-01", ageGroup: "65+", visits: 2000, admits: 700 },
      { virus: "COVID-19", week: "2025-04-08", ageGroup: "65+", visits: 2100, admits: 750 },
    
      // Influenza
      { virus: "Influenza", week: "2025-04-01", ageGroup: "0-17", visits: 1800, admits: 500 },
      { virus: "Influenza", week: "2025-04-08", ageGroup: "0-17", visits: 1900, admits: 550 },
      { virus: "Influenza", week: "2025-04-01", ageGroup: "18-64", visits: 4200, admits: 1100 },
      { virus: "Influenza", week: "2025-04-08", ageGroup: "18-64", visits: 4300, admits: 1150 },
      { virus: "Influenza", week: "2025-04-01", ageGroup: "65+", visits: 2000, admits: 700 },
      { virus: "Influenza", week: "2025-04-08", ageGroup: "65+", visits: 2200, admits: 750 },
    
      // RSV
      { virus: "RSV", week: "2025-04-01", ageGroup: "0-4", visits: 2500, admits: 900 },
      { virus: "RSV", week: "2025-04-08", ageGroup: "0-4", visits: 2700, admits: 950 },
      { virus: "RSV", week: "2025-04-01", ageGroup: "5-17", visits: 1500, admits: 300 },
      { virus: "RSV", week: "2025-04-08", ageGroup: "5-17", visits: 1600, admits: 320 }
    ],
    
    

    edByGeo: [
      // COVID-19
      { virus: "COVID-19", week: "2025-04-01", borough: "Bronx", visits: 3000, admits: 800 },
      { virus: "COVID-19", week: "2025-04-01", borough: "Brooklyn", visits: 3200, admits: 850 },
      { virus: "COVID-19", week: "2025-04-01", borough: "Manhattan", visits: 2800, admits: 700 },
      { virus: "COVID-19", week: "2025-04-01", borough: "Queens", visits: 3400, admits: 900 },
      { virus: "COVID-19", week: "2025-04-01", borough: "Staten Island", visits: 1500, admits: 400 },
      { virus: "COVID-19", week: "2025-04-08", borough: "Bronx", visits: 3100, admits: 850 },
      { virus: "COVID-19", week: "2025-04-08", borough: "Brooklyn", visits: 3300, admits: 870 },
      { virus: "COVID-19", week: "2025-04-08", borough: "Manhattan", visits: 2900, admits: 710 },
      { virus: "COVID-19", week: "2025-04-08", borough: "Queens", visits: 3500, admits: 920 },
      { virus: "COVID-19", week: "2025-04-08", borough: "Staten Island", visits: 1600, admits: 420 },
      { virus: "COVID-19", week: "2025-04-15", borough: "Bronx", visits: 3200, admits: 870 },
      { virus: "COVID-19", week: "2025-04-15", borough: "Brooklyn", visits: 3400, admits: 880 },
      { virus: "COVID-19", week: "2025-04-15", borough: "Manhattan", visits: 2950, admits: 725 },
      { virus: "COVID-19", week: "2025-04-15", borough: "Queens", visits: 3600, admits: 940 },
      { virus: "COVID-19", week: "2025-04-15", borough: "Staten Island", visits: 1650, admits: 430 },
      { virus: "COVID-19", week: "2025-04-22", borough: "Bronx", visits: 3300, admits: 880 },
      { virus: "COVID-19", week: "2025-04-22", borough: "Brooklyn", visits: 3450, admits: 890 },
      { virus: "COVID-19", week: "2025-04-22", borough: "Manhattan", visits: 3000, admits: 730 },
      { virus: "COVID-19", week: "2025-04-22", borough: "Queens", visits: 3650, admits: 950 },
      { virus: "COVID-19", week: "2025-04-22", borough: "Staten Island", visits: 1700, admits: 440 },
      { virus: "COVID-19", week: "2025-04-29", borough: "Bronx", visits: 3250, admits: 860 },
      { virus: "COVID-19", week: "2025-04-29", borough: "Brooklyn", visits: 3350, admits: 875 },
      { virus: "COVID-19", week: "2025-04-29", borough: "Manhattan", visits: 2900, admits: 715 },
      { virus: "COVID-19", week: "2025-04-29", borough: "Queens", visits: 3550, admits: 930 },
      { virus: "COVID-19", week: "2025-04-29", borough: "Staten Island", visits: 1680, admits: 435 },
    
      // Influenza
      { virus: "Influenza", week: "2025-04-01", borough: "Bronx", visits: 2000, admits: 500 },
      { virus: "Influenza", week: "2025-04-01", borough: "Brooklyn", visits: 2500, admits: 600 },
      { virus: "Influenza", week: "2025-04-01", borough: "Manhattan", visits: 1900, admits: 480 },
      { virus: "Influenza", week: "2025-04-01", borough: "Queens", visits: 2300, admits: 550 },
      { virus: "Influenza", week: "2025-04-01", borough: "Staten Island", visits: 1300, admits: 320 },
      { virus: "Influenza", week: "2025-04-08", borough: "Bronx", visits: 2100, admits: 520 },
      { virus: "Influenza", week: "2025-04-08", borough: "Brooklyn", visits: 2600, admits: 650 },
      { virus: "Influenza", week: "2025-04-08", borough: "Manhattan", visits: 2000, admits: 500 },
      { virus: "Influenza", week: "2025-04-08", borough: "Queens", visits: 2400, admits: 580 },
      { virus: "Influenza", week: "2025-04-08", borough: "Staten Island", visits: 1350, admits: 330 },
      { virus: "Influenza", week: "2025-04-15", borough: "Bronx", visits: 2200, admits: 540 },
      { virus: "Influenza", week: "2025-04-15", borough: "Brooklyn", visits: 2700, admits: 670 },
      { virus: "Influenza", week: "2025-04-15", borough: "Manhattan", visits: 2050, admits: 510 },
      { virus: "Influenza", week: "2025-04-15", borough: "Queens", visits: 2500, admits: 590 },
      { virus: "Influenza", week: "2025-04-15", borough: "Staten Island", visits: 1400, admits: 340 },
      { virus: "Influenza", week: "2025-04-22", borough: "Bronx", visits: 2300, admits: 560 },
      { virus: "Influenza", week: "2025-04-22", borough: "Brooklyn", visits: 2800, admits: 690 },
      { virus: "Influenza", week: "2025-04-22", borough: "Manhattan", visits: 2100, admits: 520 },
      { virus: "Influenza", week: "2025-04-22", borough: "Queens", visits: 2600, admits: 600 },
      { virus: "Influenza", week: "2025-04-22", borough: "Staten Island", visits: 1450, admits: 350 },
      { virus: "Influenza", week: "2025-04-29", borough: "Bronx", visits: 2250, admits: 550 },
      { virus: "Influenza", week: "2025-04-29", borough: "Brooklyn", visits: 2750, admits: 680 },
      { virus: "Influenza", week: "2025-04-29", borough: "Manhattan", visits: 2080, admits: 515 },
      { virus: "Influenza", week: "2025-04-29", borough: "Queens", visits: 2550, admits: 595 },
      { virus: "Influenza", week: "2025-04-29", borough: "Staten Island", visits: 1425, admits: 345 },
    
      // RSV
      { virus: "RSV", week: "2025-04-01", borough: "Bronx", visits: 1000, admits: 300 },
      { virus: "RSV", week: "2025-04-01", borough: "Brooklyn", visits: 1200, admits: 350 },
      { virus: "RSV", week: "2025-04-01", borough: "Manhattan", visits: 900, admits: 280 },
      { virus: "RSV", week: "2025-04-01", borough: "Queens", visits: 1100, admits: 310 },
      { virus: "RSV", week: "2025-04-01", borough: "Staten Island", visits: 800, admits: 250 },
      { virus: "RSV", week: "2025-04-08", borough: "Bronx", visits: 1050, admits: 320 },
      { virus: "RSV", week: "2025-04-08", borough: "Brooklyn", visits: 1250, admits: 370 },
      { virus: "RSV", week: "2025-04-08", borough: "Manhattan", visits: 950, admits: 290 },
      { virus: "RSV", week: "2025-04-08", borough: "Queens", visits: 1150, admits: 330 },
      { virus: "RSV", week: "2025-04-08", borough: "Staten Island", visits: 850, admits: 260 },
      { virus: "RSV", week: "2025-04-15", borough: "Bronx", visits: 1100, admits: 340 },
      { virus: "RSV", week: "2025-04-15", borough: "Brooklyn", visits: 1300, admits: 380 },
      { virus: "RSV", week: "2025-04-15", borough: "Manhattan", visits: 980, admits: 295 },
      { virus: "RSV", week: "2025-04-15", borough: "Queens", visits: 1180, admits: 335 },
      { virus: "RSV", week: "2025-04-15", borough: "Staten Island", visits: 875, admits: 270 },
      { virus: "RSV", week: "2025-04-22", borough: "Bronx", visits: 1150, admits: 350 },
      { virus: "RSV", week: "2025-04-22", borough: "Brooklyn", visits: 1350, admits: 390 },
      { virus: "RSV", week: "2025-04-22", borough: "Manhattan", visits: 1000, admits: 300 },
      { virus: "RSV", week: "2025-04-22", borough: "Queens", visits: 1200, admits: 340 },
      { virus: "RSV", week: "2025-04-22", borough: "Staten Island", visits: 900, admits: 280 },
      { virus: "RSV", week: "2025-04-29", borough: "Bronx", visits: 1125, admits: 345 },
      { virus: "RSV", week: "2025-04-29", borough: "Brooklyn", visits: 1325, admits: 385 },
      { virus: "RSV", week: "2025-04-29", borough: "Manhattan", visits: 990, admits: 298 },
      { virus: "RSV", week: "2025-04-29", borough: "Queens", visits: 1190, admits: 338 },
      { virus: "RSV", week: "2025-04-29", borough: "Staten Island", visits: 890, admits: 275 }
    ]
    
  }
};

export default edPageConfig;
