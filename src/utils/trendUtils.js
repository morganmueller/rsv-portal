
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
  