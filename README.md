# NYC Respiratory Virus Data Tracker

A responsive, modular public health dashboard developed for the NYC Department of Health and Mental Hygiene (DOHMH), visualizing respiratory virus trends across COVID-19, Influenza, RSV, and Acute Respiratory Infections (ARI).

## Developer Documentation

Full architecture, configuration, theming, and utility usage is documented in the [developer documentation](docs/developer-docs/readme.md).

Includes:

- Folder structure and roles
- Chart system and registry
- How to add pages, charts, and markdown content
- Utility function reference (`getMetricData`, `loadConfigWithData`, `getText`, etc.)
- Design tokens and theming system
- Common troubleshooting and best practices

## This tool supports:

* Seasonal comparisons  
* Markdown-powered summaries and explainers  
* Trend-based chart annotations  
* Interactive virus + metric toggles  
* CSV data exports  
* Config-driven layout generation  

## Project Structure

### /src/components

| Folder         | Purpose |
|----------------|---------|
| `cards/`       | Stat summary components (e.g. COVID, Flu) |
| `charts/`      | Vega-Lite wrappers like `LineChart`, `YearComparisonChart` |
| `contentUtils/`| Markdown rendering, token interpolation |
| `controls/`    | Virus/view toggle components and pills |
| `grids/`       | Layout helpers like `StatGrid`, `OverviewGrid` |
| `layout/`      | Core layout and page scaffolding: `ConfigDrivenPage`, `SectionWithChart` |
| `popups/`      | Info modals and download dialogs |

### /public

| Path               | Contents |
|--------------------|----------|
| `content/sections/`| Page summaries (`edSectionText.md`, etc.) |
| `content/modals/`  | Chart explainers (`emergency-dept-explainer.md`) |
| `assets/`          | Static icons, logos |
| `test-data/`       | CSVs for local development |

### /src/pages

| File                   | Purpose |
|------------------------|---------|
| `OverviewPage.jsx`     | Renders the main dashboard |
| `EmergencyDeptPage.jsx`| Emergency department trends |
| `CaseDataPage.jsx`     | Case trends by virus |
| `CovidDeathPage.jsx`   | Mortality visualizations |
| `AboutPage.jsx`        | Info content & resources |
| `DataExplorer.jsx`     | Dynamic explorer router |
| `config/*.config.js`   | Page-level configuration |

### /src/utils

| File                    | Purpose |
|-------------------------|---------|
| `chartRegistry.js`      | Maps config chart type to React component |
| `contentUtils.js`       | Resolves dot-notation keys from `text.json` |
| `downloadUtils.js`      | CSV download support |
| `trendUtils.js`         | Trend direction + subtitle logic |
| `filterMetricData.js`   | Filters and pivots long-form metrics |
| `loadCSVData.js`        | Parses CSVs using D3 |
| `loadConfigWithData.js` | Hydrates config with runtime data |
| `interpolate.js`        | Variable replacement helper |

---

## Config-Driven Architecture

Every page is driven by a structured config object that defines:

- Page title, subtitle, data source
- Control toggles (virus/view)
- Summary section (markdown + trend arrow)
- One or more charts
- Conditional rendering logic

Example config snippet in [`CaseDataPage.config.js`](src/pages/config/CaseDataPage.config.js):


## Example Config Snippet

```js
const caseDataPageConfig = {
  // Unique ID for internal tracking and routing
  id: "caseDataPage",

  // Page title and subtitle keys (resolved from text.json)
  titleKey: "caseDataPage.mainTitle",
  subtitleKey: "caseDataPage.mainSubtitle",

  // Path to raw CSV data (used with loadCSVData and hydrateConfigData)
  dataPath: "/data/caseData.csv",

  // Toggle controls available for this page
  controls: {
    virusToggle: true,   // Enable virus picker (COVID, Flu, RSV, etc.)
    viewToggle: false,   // No visit/admission toggle
  },

  // Top summary section config
  summary: {
    title: "Page Overview", // Optional override title
    markdownPath: "/content/sections/caseDataSectionText.md", // Summary content
    lastUpdated: "05/01/2025", // For display
    showTrendArrow: true, // Auto trend detection
    showSecondaryTitle: false,
    metricLabel: "cases", // Used in trends when no view toggle is present
  },

  // Section definitions (each a chart or custom content block)
  sections: [

    // 1. Seasonal comparison chart (all viruses)
    {
      id: "case-reports-season",
      title: "caseDataPage.charts.seasonalComparison.title",
      subtitle: "caseDataPage.charts.seasonalComparison.subtitle",
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Season",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "seasonalCaseTrends",
          metricName: "{virus} cases",
          submetric: "Total",
          xField: "date",
          yField: "value",
          colorField: null,
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number",
        },
      },
    },

    // 2. COVID-19 test type comparison (conditional)
    {
      id: "case-reports-test-type",
      title: "caseDataPage.charts.reportsByTestType.title",
      showIfVirus: "COVID-19",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Test Type",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "yearComparisonChart",
        props: {
          dataSourceKey: "casesByType",
          metricName: "{virus} cases by test type",
          groupField: "submetric",
          field: "isoWeek",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
          legendTitle: "Test Type",
          showRollingAvg: true,
          customColorScale: {
            domain: ["Confirmed", "Probable"],
            range: ["#9CA3AF", "#4F32B3"],
          },
        },
      },
    },

    // 3. Influenza subtype comparison
    {
      id: "case-reports-subtype",
      title: "caseDataPage.charts.reportsBySubtype.title",
      subtitle: "caseDataPage.charts.reportsBySubtype.subtitle",
      showIfVirus: "Influenza",
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Subtype",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "yearComparisonChart",
        props: {
          dataSourceKey: "casesBySubType",
          metricName: "{virus} cases by sub type",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "value"],
          defaultDisplay: "Number",
          legendTitle: "Subtype",
          showRollingAvg: false,
          customColorScale: {
            domain: ["Flu A not subtyped", "Flu A H1", "Flu A H3", "Flu B"],
            range: ["#3F007D", "#6A51A3", "#807DBA", "#9E9AC8"],
          },
        },
      },
    },

    // 4. Reports by Age Group
    {
      id: "case-reports-age",
      title: "caseDataPage.charts.reportsByAge.title",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Age Group",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "casesByAge",
          metricName: "{virus} cases by age group",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
        },
      },
    },

    // 5. Reports by Borough
    {
      id: "case-reports-borough",
      title: "caseDataPage.charts.reportsByBorough.title",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Borough",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "casesByBorough",
          metricName: "{virus} cases by borough",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
        },
      },
    },

    // 6. Reports by Race and Ethnicity (COVID-19 only)
    {
      id: "case-reports-re",
      title: "caseDataPage.charts.reportsByRE.title",
      showIfVirus: "COVID-19",
      infoIcon: true,
      downloadIcon: true,
      animateOnScroll: true,
      modal: {
        title: "{virus} Laboratory Reports by Race and Ethnicity",
        markdownPath: "/content/modals/cases-explainer.md",
      },
      chart: {
        type: "lineChart",
        props: {
          dataSourceKey: "casesByRE",
          metricName: "{virus} cases by race and ethnicity",
          groupField: "submetric",
          xField: "date",
          yField: "value",
          colorField: "submetric",
          tooltipFields: ["date", "submetric", "value"],
          defaultDisplay: "Number",
        },
      },
    },
  ],
};

export default caseDataPageConfig;

```
## Features Overview

### Markdown Integration
* Summaries + modals written in Markdown

* Supports {virus}, {viewLabel}, {trend} tokens

* Rendered via <MarkdownRenderer />

## Trend Detection & Labels
* Uses getTrendFromTimeSeries() and getTrendInfo()

* Detects up/down/same change

* Renders arrow, % delta, and direction label

* Templating supported in subtitles

## Chart System
* Charts defined by type in config (lineChart, yearComparisonChart, etc.)

* Props passed through with variable interpolation

* Chart components registered in chartRegistry.js

* Built with react-vega + Vega-Lite specs

## Toggle Controls
* virusToggle = lets user pick between COVID, Flu, RSV, etc.

* viewToggle = lets user switch between "Visits" and "Hospitalizations"

* Backed by usePageState() and shared across the page

## CSV Export
* Clickable download icon in each section

* Exports current filtered chart data using downloadCSV()

## Text Resolution
* Titles and subtitles live in text.json

* Fetched via getText("section.key.here")

* Missing keys log warnings and fallback gracefully

## Styling
* Component-level styles via .css modules

* Markdown styled in markdown.css

* Layout is responsive and animated on scroll
