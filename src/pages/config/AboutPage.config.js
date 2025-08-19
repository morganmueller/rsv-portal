// src/pages/config/AboutPage.config.js
import aboutCards from "../../data/aboutCards.json";

const aboutPageConfig = {
  id: "aboutPage",
  titleKey: "More Information",
  subtitleKey:
    "Learn about Respiratory Illnesses, the tracker, data sources, and where to find additional resources.",
  controls: { dataTypeToggle: false, virusToggle: false, viewToggle: false },

  summary: {
    titleKey: "AboutPage Summary",
    markdownPath: "/content/sections/aboutPageSectionText.md",
    lastUpdated: "05/09/2025",
    showTrendArrow: false,
    showSecondayTitle: false,
  },

  sections: [
    // Overview (unchanged)
 
    {
      id: "about-tracker",
      titleKey: "About the Tracker",
      renderAs: "paragraph",
      markdownSection: "About the Tracker",
    },
    {
      id: "prevention-info",
      titleKey: "Prevention and Vaccination Information",
      renderAs: "cards",
      markdownSection: "Prevention and Vaccination Information",
      cards: aboutCards["prevention-info"],
    },

    // NEW: group header before the data paragraphs
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
          titleKey: "Influenza‑associated pediatric deaths",
          markdownSection: "Influenza‑associated pediatric deaths",
        },
        {
          id: "inequities",
          titleKey: "Health inequities",
          markdownSection: "Health inequities",
        },
        
      ],
    },


    {
      id: "provider-info",
      titleKey: "",
      renderAs: "cards",
      subtitle:`The Respiratory Illness Data pages show data on COVID-19, influenza, and RSV in New York City collected by the NYC Health Department. Find health information and guidance for each illness:`,
      markdownSection: "Learn about Respiratory Illnesses",
      cards: aboutCards["provider-info"],
    },

    // Paragraphs (unchanged)
    {
      id: "seasonality",
      titleKey: "Respiratory Virus Seasonality",
      renderAs: "paragraph",
      markdownSection: "Respiratory Virus Seasonality",
    },
    {
      id: "transparency",
      titleKey: "Data Transparency",
      renderAs: "paragraph",
      markdownSection: "Data Transparency",
    },
  ],
};

export default aboutPageConfig;
