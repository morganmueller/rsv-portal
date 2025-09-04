import edPageConfig from "../EmergencyDeptPage.config";
import caseDataPageConfig from "../CaseDataPage.config";

const rsvPageConfig = {
  id: "rsvPage",
  titleKey: {
    ed: "emergencyDeptPage.mainTitle",
    lab: "caseDataPage.mainTitle",
    death: "covidDeathPage.mainTitle"
  },
  subtitleKey: {
    ed: "emergencyDeptPage.mainSubtitle",
    lab: "caseDataPage.mainSubtitle",
    death: "covidDeathPage.mainSubtitle"
  },
  
  
  dataPath: {
    ed: edPageConfig.dataPath,
    lab: caseDataPageConfig.dataPath,
  },

  controls: {
    ...edPageConfig.controls,
  },

  defaultView: edPageConfig.defaultView,

  summary: {
    ed:    { ...edPageConfig.summary },
    lab:   { ...caseDataPageConfig.summary },
  },

  sections: [
    ...edPageConfig.sections,
    ...caseDataPageConfig.sections.filter(
      (s) => !s.showIfVirus // includes RSV and general
    ),
  ],
};

export default rsvPageConfig;
