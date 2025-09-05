const colors = {
  // Grayscale
  white: "#FFFFFF",
  black: "#000000",
  footnoteGray: "#687482",
  gray100: "#F9FAFB",
  gray200: "#F3F4F6",
  gray300: "#E5E7EB",
  gray400: "#D1D5DB",
  gray500: "#9CA3AF", 
  gray600: "#6B7280",
  gray700: "#4B5563",
  gray800: "#374151",
  gray900: "#1F2937",
  grayTransparent: "rgba(0, 0, 0, 0)",

  // Main / Accent
  bluePrimary: "#1E40AF",
  blueSecondary: "#2563EB",
  blueAccent: "#0075FF",
  purplePrimary: "#5B21B6",
  purpleAccent: "#7C3AED",
  greenPrimary: "#065F46",
  greenAccent: "#139D72",
  greenMuted: "#059669",
  orangeText: "#91401A",
  orangePrimary: "#FF6600",
  orangeAccent: "#B36C31",
  orangeMuted: "#FF6C0B",
  redPrimary: "#B91C1C",
  redAccent: "#DC2626",
  redMuted: "#F87171",
  
  // Semantic backgrounds
  bgLightBlue: "#EFF6FF",
  bgLightGreen: "#ECFDF5",
  bgLightOrange: "#F4C4A5",
  bgLightPurple: "#F5F3FF",
  bgMutedPink: "#F4C4A5",
  bgMutedPurple: "#F5F3FF",
  bgMutedGray: "#ADAEBC",
};

const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
};

const typography = {
  body: '"Inter", sans-serif',
  heading: '"Inter", sans-serif',
  fontSizeBase: "14px",
  fontSizeLg: "18px",
  weightBold: "bold" 
};

const radii = {
  sm: "4px",
  md: "6px",
  lg: "8px",
};

const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px rgba(0,0,0,0.1)",
};

const colorScales = {
  covid: [
    "#08306B", // dark blue
    "#08519C", // strong blue
    "#2171B5", // medium blue
    "#4292C6", // lighter blue
    "#6BAED6"  // pale blue
  ],
  
  flu: [
    "#4A1486", // deep purple
    "#6A51A3", // mid purple
    "#807DBA", // softer purple
    "#9E9AC8", // lavender
    "#BCBDDC"  // pale violet
  ],
  
  rsv: [
    "#00441B", // deep green
    "#1B7837", // strong green
    "#41AB5D", // medium green
    "#78C679", // light green
    "#C2E699"  // pale green
  ],
  ari: ["#FF6600"]
};

export const tokens = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  colorScales,
};
