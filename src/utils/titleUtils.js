// src/utils/titleUtils.jsx
import React from "react";
import { tokens } from "../styles/tokens";

// template: string with placeholders like {virus}, {viewLabel}, etc.
// ctx: { virus: "COVID-19" | "Flu" | "RSV" | "ARI", virusKey: "covid"|"flu"|"rsv"|"ari", viewLabel, viewLabelPreposition, virusLabelArticle, date, trend, ... }
export function renderInterpolatedTitle(template, ctx) {
  const map = {
    "{viewLabel}": ctx.viewLabel ?? "",
    "{viewLabelPreposition}": ctx.viewLabelPreposition ?? "",
    "{virusLabelArticle}": ctx.virusLabelArticle ?? "",
    "{date}": ctx.date ?? "",
    "{trend}": ctx.trend ?? "",
    // The special one: return JSX for {virus}
    "{virus}": (
      <span
        key="virus-chip"
        className={`virus-label virus-${ctx.virusKey}`}
        style={{
          // Inline style from tokens, so you don’t have to hardcode CSS colors
          color: tokens.colorScales?.[ctx.virusKey]?.base ??
                 tokens.colorScales?.[ctx.virusKey]?.primary ??
                 "currentColor",
          fontWeight: 700,
        }}
      >
        {ctx.virus}
      </span>
    ),
  };

  // Split into tokens and swap placeholders with either strings or JSX
  return (
    <>
      {template
        .split(/(\{[^}]+\})/g)
        .filter(Boolean)
        .map((chunk, i) => (map[chunk] !== undefined ? React.cloneElement(map[chunk], { key: i }) : <React.Fragment key={i}>{chunk}</React.Fragment>))}
    </>
  );
}
