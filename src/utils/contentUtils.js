import text from "../../public/content/text.json";

export const getText = (path) => {
  return path.split(".").reduce((acc, key) => acc?.[key], text);
};
