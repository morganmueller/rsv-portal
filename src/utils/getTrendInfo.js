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
  