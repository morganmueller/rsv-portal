// src/pages/config/AboutPage.config.js
import aboutCards from "../../data/aboutCards.json";

const aboutPageConfig = {
  id: "aboutPage",
  titleKey: "About this Site",
  subtitleKey:
    "<span class='dynamic-label'>The Respiratory Illness Data Pages</span> show data on <a href='https://www.nyc.gov/site/doh/covid/covid-19-main.page' target='_blank' rel='noopener noreferrer'>COVID-19</a>, <a href='https://www.nyc.gov/site/doh/health/health-topics/flu-seasonal.page' target='_blank' rel='noopener noreferrer'>flu (influenza)</a>, and <a href='https://www.nyc.gov/site/doh/health/health-topics/respiratory-syncytial-virus.page' target='_blank'  rel='noopener noreferrer'>RSV (respiratory syncytial virus)</a> in <span class='dynamic-label'>New York City</span> collected by the <span class='dynamic-label'>NYC Health Department</span>.",
  controls: { dataTypeToggle: false, virusToggle: false, viewToggle: false },

  summary: {
    titleKey: "AboutPage Summary",
    markdownPath: "/content/sections/aboutPageSectionText.md",
    lastUpdated: "05/09/2025",
    showTrendArrow: false,
    showSecondayTitle: false,
  },

  sections: [
    {
      id: "provider-info",
      titleKey: "",
      renderAs: "cards",
      subtitle:`Find health information and guidance for each illness:`,
      markdownSection: "Learn about Respiratory Illnesses",
      cards: aboutCards["provider-info"],
    },

    {
      id: "data-group",
      renderAs: "paragraph-group",
      groupTitleKey: "Data Information", // big header before the items
      items: [
        {
          id: "about-data",
          titleKey: "About the data",
          markdownSection: "About the data",
        },
        {
          id: "archived",
          titleKey: "Archived data on respiratory illnesses in NYC",
          markdownSection: "Archived data on respiratory illnesses in NYC",
        },
        {
          id: "ed-visits",
          titleKey: "Emergency department visits and hospitalizations",
          markdownSection: "Emergency department visits and hospitalizations",
        },
        {
          id: "lab-reports",
          titleKey: "Laboratory-reported cases",
          markdownSection: "Laboratory-reported cases",
        },
        {
          id: "covid-deaths",
          titleKey: "COVID‑19 deaths",
          markdownSection: "COVID‑19 deaths",
        },
        {
          id: "flu-peds-deaths",
          titleKey: "Flu‑associated pediatric deaths",
          markdownSection: "Flu‑associated pediatric deaths",
        },
        {
          id: "inequities",
          titleKey: "Health inequities",
          markdownSection: "Health inequities",
        },
        {
          id: "seasonality",
          titleKey: "Respiratory Virus Seasonality",
          markdownSection: "Respiratory Virus Seasonality",
        },
        {
          id: "transparency",
          titleKey: "Data Transparency",
          markdownSection: "Data Transparency",
        },
      ],
    },


    {
      id: "prevention-info",
      titleKey: "Additional Resources",
      renderAs: "cards",
      markdownSection: "Additional Resources",
      cards: aboutCards["prevention-info"],
    },

  ],
};

export default aboutPageConfig;
