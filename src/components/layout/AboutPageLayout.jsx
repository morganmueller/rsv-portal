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
        .catch((err) =>
          console.error("Failed to fetch about page markdown:", err)
        );
    }
  }, [summary?.markdownPath]);

  const overview = sections.filter((s) => s.renderAs === "overview");

  return (
    <DataPageLayout
      title={resolveText(titleKey)}
      subtitle={resolveText(subtitleKey)}
    >
      <div className="about-page">
        {overview.length === 2 && (
          <div className="about-row">
            <section className="about-surface intro-section">
              <OverviewSection
                leftTitle={resolveText(overview[0].titleKey)}
                rightTitle={resolveText(overview[1].titleKey)}
                leftContent={
                  <div className="about-narrow">
                    <MarkdownRenderer
                      rawContent={markdown}
                      sectionTitle={overview[0].markdownSection}
                      stripRenderDirectives={true}
                    />
                  </div>
                }
                rightContent={
                  <div className="about-narrow">
                    <MarkdownRenderer
                      rawContent={markdown}
                      sectionTitle={overview[1].markdownSection}
                      stripRenderDirectives={true}
                    />
                  </div>
                }
              />
            </section>
          </div>
        )}

        

        {sections.map((section, idx) => {
          const isOverview = section.renderAs === "overview";
          const isHidden = section.renderAs === "hidden";
          const key = section.id || idx;
          if (isOverview || isHidden) return null;

          // --- cards ---
          if (section.renderAs === "cards") {
            return (
              <div className="about-row" >
                <section key={key} className="about-surface card-section" aria-labelledby={`${key}-h`}>
                  {/* Let the card section render its own internal title if provided */}
                  <MarkdownCardSection
                    title={resolveText(section.titleKey)}
                    
                    markdown={markdown}
                    sectionTitle={section.markdownSection}
                    sectionSubtitle={section.subtitle}
                    cards={section.cards.map((card) => ({
                      ...card,
                      title: resolveText(card.titleKey),
                    }))}
                  />
                </section>
              </div>
            );
          }

          // --- paragraph ---
          if (section.renderAs === "paragraph") {
            return (
              <div className="about-row" key={key}>
                <section id={key} className="about-surface markdown-paragraph-section" aria-labelledby={`${key}-h`}>
                  <div className="about-narrow">
                    <MarkdownParagraphSection
                      title={resolveText(section.titleKey)}
                      markdown={markdown}
                      sectionTitle={section.markdownSection}
                    />
                  </div>
                </section>
              </div>
            );
          }

          // --- paragraph group ---
          if (section.renderAs === "paragraph-group") {
            const groupTitle = resolveText(section.groupTitleKey || section.titleKey);
            const items = Array.isArray(section.items) ? section.items : [];
            if (!items.length) return null;

            return (
              <div className="about-row" key={key}>
                <section id={key} className="about-surface" aria-labelledby={`${key}-h`}>
                  <div className="about-narrow">
                    {groupTitle && (
                      <h2 className="markdown-group-title" id={`${key}-h`}>
                        {groupTitle}
                      </h2>
                    )}

                    {items.map((item, itemIdx) => (
                      <MarkdownParagraphSection
                        key={`${key}-${item.id || itemIdx}`}
                        title={resolveText(item.titleKey)}
                        markdown={markdown}
                        sectionTitle={item.markdownSection}
                      />
                    ))}
                  </div>
                </section>
              </div>
            );
          }

          return null;
        })}
      </div>
    </DataPageLayout>
  );
};

AboutPageLayout.propTypes = {
  config: PropTypes.object.isRequired,
};

export default AboutPageLayout;
