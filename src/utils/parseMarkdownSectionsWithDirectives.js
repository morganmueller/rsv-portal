export const parseMarkdownSectionsWithDirectives = (markdown) => {
  const lines = markdown.split("\n");
  const sections = [];

  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      if (current) sections.push(current);

      const title = line.replace("## ", "").trim();
      const nextLine = lines[i + 1]?.trim().toLowerCase();
      const renderMatch = nextLine?.startsWith("render:")
        ? nextLine.replace("render:", "").trim()
        : null;

      current = {
        title,
        render: renderMatch,
        hasCards: false,
      };
    }

    if (line.startsWith("### ") && current) {
      current.hasCards = true;
    }
  }

  if (current) sections.push(current);

  return sections;
};
