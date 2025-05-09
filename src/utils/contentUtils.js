import text from "../content/text.json";

console.log("Loaded text.json:", text); // Add this

export const getText = (path, fallback = path) => {
  const result = path.split(".").reduce((acc, key) => acc?.[key], text);
  if (result === undefined) {
    console.warn(`[getText] Missing text key: ${path}`);
  }
  return result ?? fallback;
};
