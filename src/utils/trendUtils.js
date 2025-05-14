
export function getTrendFromTimeSeries(data, key) {
    if (!Array.isArray(data) || data.length < 2) return null;
  
    const current = data.at(-1)?.[key];
    const previous = data.at(-2)?.[key];
  
    if (typeof current !== "number" || typeof previous !== "number" || previous === 0) return null;
  
    const change = ((current - previous) / previous) * 100;
  
    if (change > 0.5) {
      return { label: "increased", value: Math.round(change), direction: "up" };
    } else if (change < -0.5) {
      return { label: "decreased", value: Math.abs(Math.round(change)), direction: "down" };
    } else {
      return { label: "not changed", value: 0, direction: "neutral" };
    }
  }

  // utils/trendUtils.js

export function generateTrendSubtitle({ view, trendObj, latestWeek }) {
  if (!trendObj || typeof trendObj !== "object") return null;

  const directionText = trendObj.label?.toLowerCase(); // "increased", "decreased", etc.
  const valueText = trendObj.value ? `${trendObj.value}%` : "";
  const metric = view === "admits" ? "admits" : "visits";

  return `${capitalize(metric)} for the week of ${formatDate(latestWeek)} have ${directionText} ${valueText} since the previous week.`;
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

  