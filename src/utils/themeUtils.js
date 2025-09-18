// utils/themeUtils.js
import { tokens } from "../styles/tokens";
const { colors } = tokens;

/**
 * Normalize any incoming title to a canonical theme key.
 * Handles suffixes like "visits", "admissions", "cases", "by age group",
 * extra descriptors like "(ED)", and common aliases ("flu", "covid").
 */
function normalizeTitleForTheme(raw) {
  if (!raw || typeof raw !== "string") return "Overall respiratory illness";
  let t = raw.toLowerCase().trim();

  // strip content in parentheses and common suffix phrases
  t = t.replace(/\(.*?\)/g, " "); // remove parenthetical
  t = t
    .replace(/\bby age group\b/g, " ")
    .replace(/\b(per ?cent|percent|share|rate|trend|ed)\b/g, " ")
    .replace(/\b(visits?|admissions?|hospitali[sz]ations?|cases?)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // quick canonical buckets
  if (t.includes("covid") || t.includes("sars") || t.includes("coronavirus")) {
    return "COVID-19";
  }
  if (t.includes("influenza") || t === "flu" || t.includes("flu")) {
    return "Flu";
  }
  if (t.includes("rsv")) {
    return "RSV";
  }
  if (
    t.includes("overall") ||
    t === "ari" ||
    t.includes("respiratory illness") ||
    t.includes("resp illness") ||
    t.includes("respiratory")
  ) {
    return "Overall respiratory illness";
  }

  // default: try exact-cased keys before final fallback
  const candidates = ["COVID-19", "Flu", "RSV", "Overall respiratory illness"];
  const hit = candidates.find((k) => k.toLowerCase() === t);
  return hit || "Overall respiratory illness";
}

const themeMap = {
  "COVID-19": {
    color: colors.bluePrimary,
    background: colors.bgLightBlue,
    icon: "/assets/covid-vector.svg",
  },
  Flu: {
    color: colors.purplePrimary,
    background: colors.bgLightPurple,
    icon: "/assets/flu-vector.svg",
  },
  RSV: {
    color: colors.greenPrimary,
    background: colors.bgLightGreen,
    icon: "/assets/rsv-vector.svg",
  },
  "Overall respiratory illness": {
    color: colors.orangeText,
    background: colors.bgLightOrange,
    icon: "/assets/ari-vector.svg",
  },
};

const defaultTheme = {
  color: colors.gray800,
  background: colors.gray100,
  icon: null,
};

export function getThemeByTitle(title) {
  const key = normalizeTitleForTheme(title);
  return themeMap[key] || defaultTheme;
}

// Optional export if you want to debug what key a title resolves to
export { normalizeTitleForTheme };
