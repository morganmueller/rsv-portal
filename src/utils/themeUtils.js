// utils/themeUtils.js
import { tokens } from "../styles/tokens";

const { colors } = tokens;

const themeMap = {
  "COVID-19": {
    color: colors.bluePrimary,
    background: colors.bgLightBlue,
    icon: "/assets/covid-vector.svg",
  },
  "Influenza": {
    color: colors.purplePrimary,
    background: colors.bgLightPurple,
    icon: "/assets/flu-vector.svg",
  },
  "RSV": {
    color: colors.greenPrimary,
    background: colors.bgLightGreen,
    icon: "/assets/rsv-vector.svg",
  },
  "ARI": {
    color: colors.orangeText,
    background: colors.bgLightOrange,
    icon: "/assets/ari-vector.svg",
  },
  "Acute Respiratory Infections": {
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
  return themeMap[title] || defaultTheme;
}
