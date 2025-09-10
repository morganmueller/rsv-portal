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
         // ...inside sections.map(...)
const isOverview = section.renderAs === "overview";
const isHidden = section.renderAs === "hidden";
const key = section.id || `sec-${idx}`;
if (isOverview || isHidden) return null;

const headingText =
  (section.groupTitleKey && resolveText(section.groupTitleKey)) ||
  resolveText(section.titleKey) ||
  ""; // fallback
const headingId = `${key}-h`;

// a tiny visually-hidden style (avoid relying on a global .sr-only)
const srOnlyStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

if (section.renderAs === "cards") {
  return (
    <div className="about-row" key={key}>
      <section className="about-surface card-section" role="region" aria-labelledby={headingId}>
        <h2 id={headingId} style={srOnlyStyle}>{headingText || "Section"}</h2>

        <MarkdownCardSection
          title={resolveText(section.titleKey)}
          markdown={markdown}
          sectionTitle={section.markdownSection}
          sectionSubtitle={section.subtitle}
          cards={(section.cards || []).map((card) => ({
            ...card,
            title: resolveText(card.titleKey),
          }))}
        />
      </section>
    </div>
  );
}

if (section.renderAs === "paragraph") {
  return (
    <div className="about-row" key={key}>
      <section id={key} className="about-surface markdown-paragraph-section" role="region" aria-labelledby={headingId}>
        <h2 id={headingId} style={srOnlyStyle}>{headingText || "Section"}</h2>

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

if (section.renderAs === "paragraph-group") {
  const groupTitle = resolveText(section.groupTitleKey || section.titleKey);
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;

  return (
    <div className="about-row" key={key}>
      <section id={key} className="about-surface" role="region" aria-labelledby={headingId}>
        <div className="about-narrow">
          {groupTitle && (
            <h2 className="markdown-group-title" id={headingId}>
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
