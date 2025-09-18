import { tokens } from "../styles/tokens";

// map the visible words you'll see in titles to your scale keys
const VIRUS_KEY_BY_LABEL = {
  "COVID-19": "covid",
  "Influenza": "flu",
  "Flu": "flu",
  "RSV": "rsv",
  "ARI": "ari",
};

// build one regex that prefers longer words first (Influenza before Flu)
const VIRUS_PATTERN = /(COVID-19|Influenza|Flu|RSV|ARI)/g;

export function colorizeVirusInTitle(title) {
  if (typeof title !== "string" || !title) return title;

  return title.replace(VIRUS_PATTERN, (match) => {
    const key = VIRUS_KEY_BY_LABEL[match];
    const scale = tokens.colorScales?.[key];
    const color = Array.isArray(scale) ? scale[1] : undefined; // darkest shade for text
    const cls = `virus-label virus-${key || "unknown"}`;
    const style = color ? ` style="color:${color}"` : "";
    return `<span class="${cls}"${style}>${match}</span>`;
  });
}
