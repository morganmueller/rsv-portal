NYC Respiratory Virus Data Tracker

This project powers a responsive, modular dashboard for the NYC Department of Health and Mental Hygiene (DOHMH), visualizing respiratory virus trends across COVID-19, Influenza, RSV, Acute Respiratory Infections (ARI), and more. Features include seasonal comparisons, dynamic chart loading, plain-language summaries, and interactive toggles for virus and metric filtering.

---

## 📁 Project Structure

/components
cards/ → Stat cards (e.g. COVID, Flu, RSV)
charts/ → Vega-Lite chart wrappers
contentUtils/ → Markdown rendering & text interpolation
controls/ → Virus + view toggle components
grids/ → Grid layout helpers (e.g. StatGrid)
layout/ → Page scaffolds (DataPageLayout, SectionWithChart)
popups/ → Info modals

/public/content
sections/ → Summary markdown (e.g. edSectionText.md)
modals/ → Chart explainer markdown

/data
edPageConfig.js
caseDataPageConfig.js
covidDeathPageConfig.js

/utils
chartRegistry.js → Chart type map for config system
contentUtils.js → Text key resolver (dot notation)
downloadUtils.js → CSV download helper
trendUtils.js → Computes week-over-week percent change

yaml
Copy
Edit

---

## ⚙️ Config-Driven Architecture

All data pages are dynamically rendered based on a config object passed to `<ConfigDrivenPage />`. This reduces duplication and centralizes logic for scalability.

### 🔧 Example Config

```js
{
  id: "emergencyDeptPage",
  titleKey: "emergencyDeptPage.mainTitle",
  subtitleKey: "emergencyDeptPage.mainSubtitle",

  summary: {
    title: "Emergency Department Summary",
    markdownPath: "/content/sections/edSectionText.md",
    lastUpdated: "05/10/2025",
    showTrendArrow: true,
    animateOnScroll: true,
    metricLabel: "visits"
  },

  controls: {
    virusToggle: true,
    viewToggle: true
  },

  sections: [
    {
      id: "seasonal-ed",
      title: "emergencyDeptPage.charts.seasonalComparison.title",
      subtitle: "emergencyDeptPage.charts.seasonalComparison.subtitle",
      chart: {
        type: "edSeasonalComparisonChart",
        props: {
          dataSourceKey: "seasonalEDData",
          virus: "{virus}",
          view: "{view}"
        }
      },
      modal: {
        title: "Seasonal ED {view}",
        markdownPath: "/content/modals/emergency-dept-explainer.md"
      },
      infoIcon: true,
      downloadIcon: true,
      trendEnabled: true,
      animateOnScroll: true
    }
  ],

  data: {
    seasonalEDData: [
      { week: "2025-01-01", visits: 12500, admits: 3100 },
      { week: "2025-01-08", visits: 13000, admits: 3200 }
    ]
  }
}
```
🧠 Key Features
✅ Markdown-Powered Content
Markdown-based summaries and chart explainers

Located in /public/content/sections/ and /modals/

Supports template tags like {virus}, {view}, {trend} within markdown

Modal content rendered using MarkdownRenderer

✅ Interactive Toggles
virusToggle: Filter by respiratory virus

viewToggle: Switch between visit and admission rates

Shared state handled with usePageState()

✅ Chart System
Charts registered in /utils/chartRegistry.js

Vega-Lite based chart components (using react-vega)

Config defines type and props, data passed automatically

✅ Trend Detection & Labels
Uses getTrendFromTimeSeries(data, metric) from trendUtils.js

Auto-calculates up/down arrows and percent change for summaries

{trend} placeholder available in subtitles

✅ CSV Downloads
Charts support export via downloadCSV(data, filename) from downloadUtils.js

Triggered through download icon in chart header

🧩 Runtime Text Resolution
All titles and subtitles are stored in text.json and accessed via dot notation (e.g. overview.charts.monthlyARIChart.title)

Resolved using getText(path) from contentUtils.js

🖼️ UI & Styling
CSS Modules for component-scoped styles

Markdown styled via markdown.css

Header includes route-aware buttons and dropdown topic selector
