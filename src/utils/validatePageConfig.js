/**
 * validatePageConfig.js
 *
 * Utility to validate the structure of a ConfigDrivenPage config object.
 * Call this function in development or testing to catch misconfigured keys.
 *
 * ✅ Example usage:
 *
 * import aboutPageConfig from "../configs/aboutPage.config.js";
 * import { validatePageConfig } from "../utils/validatePageConfig.js";
 *
 * const errors = validatePageConfig(aboutPageConfig);
 * if (errors.length > 0) {
 *   console.warn("Config validation errors:", errors);
 * }
 */
/**
 * validatePageConfig.js
 *
 * Utility to validate the structure of a ConfigDrivenPage config object.
 * Call this function in development or testing to catch misconfigured keys.
 *
 * ✅ Example usage:
 *
 * import aboutPageConfig from "../configs/aboutPage.config.js";
 * import { validatePageConfig } from "../utils/validatePageConfig.js";
 *
 * const errors = validatePageConfig(aboutPageConfig);
 * if (errors.length > 0) {
 *   console.warn("Config validation errors:", errors);
 * }
 */

export function validatePageConfig(config) {
  const errors = [];

  const allowedRenderTypes = ["cards", "paragraph", "overview", "hidden"];

  if (!config.id) errors.push("Missing `id` field.");
  if (!config.titleKey) errors.push("Missing `titleKey`.");
  if (!config.subtitleKey) errors.push("Missing `subtitleKey`.");

  if (!config.summary?.markdownPath) {
    errors.push("Missing `summary.markdownPath` for page summary.");
  }

  if (!Array.isArray(config.sections)) {
    errors.push("`sections` must be an array.");
  } else {
    config.sections.forEach((section, i) => {
      const prefix = `Section[${i}]:`;

      if (!section.titleKey) errors.push(`${prefix} Missing \`titleKey\`.`);
      if (!section.renderAs) {
        errors.push(`${prefix} Missing \`renderAs\`.`);
      } else if (!allowedRenderTypes.includes(section.renderAs)) {
        errors.push(
          `${prefix} Invalid \`renderAs\` value "${section.renderAs}". Must be one of: ${allowedRenderTypes.join(
            ", "
          )}.`
        );
      }

      if (["cards", "paragraph", "overview"].includes(section.renderAs)) {
        if (!section.markdownSection) {
          errors.push(`${prefix} Missing \`markdownSection\` for renderAs = "${section.renderAs}".`);
        }
      }

      if (section.renderAs === "cards") {
        if (!Array.isArray(section.cards)) {
          errors.push(`${prefix} Cards section must include a \`cards\` array.`);
        } else {
          section.cards.forEach((card, j) => {
            const missing = [];
            if (!card.titleKey) missing.push("titleKey");
            if (!card.link) missing.push("link");
            if (!card.icon) missing.push("icon");
            if (missing.length > 0) {
              errors.push(`${prefix} Card[${j}] missing required fields: ${missing.join(", ")}.`);
            }
          });
        }
      }

      if (section.chart) {
        if (!section.chart.type) errors.push(`${prefix} Chart section missing \`chart.type\`.`);
        if (!section.chart.props?.dataSourceKey) {
          errors.push(`${prefix} Chart section missing \`chart.props.dataSourceKey\`.`);
        }
      }
    });
  }

  return errors;
}
