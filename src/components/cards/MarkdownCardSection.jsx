import React from "react";
import PropTypes from "prop-types";
import InfoCard from "./InfoCard";

// Extract cards from a markdown section with ### subheaders and icon/link lines
const extractCards = (markdown, sectionTitle) => {
  if (!markdown || !sectionTitle) return [];

  const sectionRegex = new RegExp(`## ${sectionTitle}[\\s\\S]*?(?=\\n## |$)`, "i");
  const match = markdown.match(sectionRegex);
  if (!match) return [];

  const lines = match[0].split("\n").slice(1); // Skip the ## title line

  const cards = [];
  let current = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      if (current) cards.push(current);
      current = {
        title: trimmed.replace("### ", "").trim(),
        description: "",
        icon: "",
        link: "",
      };
    } else if (trimmed.startsWith("icon:")) {
      if (current) current.icon = trimmed.replace("icon:", "").trim();
    } else if (trimmed.startsWith("link:")) {
      if (current) current.link = trimmed.replace("link:", "").trim();
    } else if (current) {
      current.description += trimmed + " ";
    }
  });

  if (current) cards.push(current);

  return cards.map((card) => ({
    ...card,
    description: card.description.trim(),
  }));
};

const MarkdownCardSection = ({ markdown, sectionTitle }) => {
  const cards = extractCards(markdown, sectionTitle);

  return (
    <section className="card-section">
      <h2>{sectionTitle}</h2>
      <div className="card-grid">
        {cards.map((card, idx) => (
          <InfoCard key={idx} {...card} />
        ))}
      </div>
    </section>
  );
};

MarkdownCardSection.propTypes = {
  markdown: PropTypes.string.isRequired,
  sectionTitle: PropTypes.string.isRequired,
};

export default MarkdownCardSection;
