
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
  const metric = view === "hospitalizations" ? "hospitalizations" : "visits";

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

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

  
export function capitalizeFirstHtml(str) {
  if (!str) return str;

  // Find the first visible character that is not inside a tag
  const tagRegex = /(<[^>]+>)*([^<])/;
  const match = str.match(tagRegex);
  if (!match) return str;

  const index = str.indexOf(match[2]);
  return (
    str.slice(0, index) +
    match[2].toUpperCase() +
    str.slice(index + 1)
  );
}


export const getTrendInfo = ({ trendDirection, metricLabel, virus }) => {
  if (!trendDirection) return null;

  const colorMap = {
    up: "var(--red-accent)",
    down: "var(--green-muted)",
    same: "var(--black)",
  };

  const arrowMap = {
    up: "▲",
    down: "▼",
    same: "●", // or use "" if you want no symbol
  };

  const directionTextMap = {
    up: "higher than last week",
    down: "lower than last week",
    same: "the same as last week",
  };

  return {
    trendColor: colorMap[trendDirection],
    arrow: arrowMap[trendDirection],
    directionText: directionTextMap[trendDirection],
    label: `${virus} ${metricLabel} are `,
  };
};
