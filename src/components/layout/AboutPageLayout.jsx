import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DataPageLayout from "./DataPageLayout";
import MarkdownRenderer from "../contentUtils/MarkdownRenderer";
import OverviewSection from "../../pages/Overview/OverviewSection";
import MarkdownCardSection from "../cards/MarkdownCardSection";
import MarkdownParagraphSection from "../contentUtils/MarkdownParagraphSection";
import { getText } from "../../utils/contentUtils";
import "./AboutPageLayout.css";

const resolveText = (input) =>
  typeof input === "string" && input.includes(".") ? getText(input) : input;

const AboutPageLayout = ({ config }) => {
  const { titleKey, subtitleKey, summary, sections = [] } = config;
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (summary?.markdownPath) {
      fetch(summary.markdownPath)
        .then((res) => res.text())
        .then(setMarkdown)
        .catch((err) => console.error("Failed to fetch about page markdown:", err));
    }
  }, [summary?.markdownPath]);

  // Only use the exact 2 overview sections, in correct order
  const overview = sections.filter((s) => s.renderAs === "overview");

  return (
    <DataPageLayout
      title={resolveText(titleKey)}
      subtitle={resolveText(subtitleKey)}
    >
      {overview.length === 2 && (
        <OverviewSection
          leftTitle={resolveText(overview[0].titleKey)}
          rightTitle={resolveText(overview[1].titleKey)}
          leftContent={
            <MarkdownRenderer
              rawContent={markdown}
              sectionTitle={overview[0].markdownSection}
              stripRenderDirectives={true}
            />
          }
          rightContent={
            <MarkdownRenderer
              rawContent={markdown}
              sectionTitle={overview[1].markdownSection}
              stripRenderDirectives={true}
            />
          }
        />
      )}

      {sections.map((section, idx) => {
        const isOverview = section.renderAs === "overview";
        const isHidden = section.renderAs === "hidden";
        const key = section.id || idx;

        if (isOverview || isHidden) return null;

        if (section.renderAs === "cards") {
          return (
            <MarkdownCardSection
              key={key}
              title={resolveText(section.titleKey)}
              markdown={markdown}
              sectionTitle={section.markdownSection}
              cards={section.cards.map((card) => ({
                ...card,
                title: resolveText(card.titleKey),
              }))}
            />
          );
        }

        if (section.renderAs === "paragraph") {
          return (
            <MarkdownParagraphSection
              key={key}
              title={resolveText(section.titleKey)}
              markdown={markdown}
              sectionTitle={section.markdownSection}
            />
          );
        }

        return null;
      })}
    </DataPageLayout>
  );
};

AboutPageLayout.propTypes = {
  config: PropTypes.object.isRequired,
};

export default AboutPageLayout;
