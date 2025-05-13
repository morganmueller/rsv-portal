import aboutCards from "../../data/aboutCards.json";

const aboutPageConfig = {
  id: "aboutPage",
  titleKey: "aboutPage.mainTitle",
  subtitleKey: "aboutPage.mainSubtitle",
  summary: {
    titleKey: "aboutPage.summary.title",
    markdownPath: "/content/sections/aboutPageSectionText.md",
    lastUpdated: "05/09/2025",
    showTrendArrow: false,
    showSecondayTitle: false,
  },
  sections: [
    {
      id: "learn",
      titleKey: "aboutPage.sections.learn.title",
      renderAs: "overview",
      markdownSection: "Learn about Respiratory Illnesses",
    },
    {
      id: "about-tracker",
      titleKey: "aboutPage.sections.aboutTracker.title",
      renderAs: "overview",
      markdownSection: "About the Tracker",
    },
    {
      id: "prevention-info",
      titleKey: "aboutPage.sections.prevention.title",
      renderAs: "cards",
      markdownSection: "Prevention and Vaccination Information",
      cards: aboutCards["prevention-info"],
    },
    {
      id: "provider-info",
      titleKey: "aboutPage.sections.providers.title",
      renderAs: "cards",
      markdownSection: "Information for Providers",
      cards: aboutCards["provider-info"],
    },
    {
      id: "seasonality",
      titleKey: "aboutPage.sections.seasonality.title",
      renderAs: "paragraph",
      markdownSection: "Respiratory Virus Seasonality",
    },
    {
      id: "transparency",
      titleKey: "aboutPage.sections.transparency.title",
      renderAs: "paragraph",
      markdownSection: "Data Transparency",
    },
  ],
};

export default aboutPageConfig;
