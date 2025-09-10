import React from "react";
import { marked } from "marked";
import { tokens } from "../../styles/tokens";

const { typography, colors, spacing } = tokens;

const ChartFooter = ({ dataSource, latestDate, footnote }) => {
  const formattedDate = latestDate
    ? new Date(latestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      style={{
        fontWeight: typography.weightBold,
        fontSize: typography.fontSizeBase,
        color: colors.footnoteGray,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: spacing.sm,
          width: "100%",
        }}
      >
        {/* Left side (footnote or empty) */}
        <div
          style={{
            flex: 1,
            fontSize: typography.fontSizeSmall,
            color: colors.footnoteGray,
          }}
          dangerouslySetInnerHTML={
            footnote ? { __html: marked.parseInline(footnote) } : undefined
          }
        />

        {/* Right side (always right-aligned) */}
        <div style={{ whiteSpace: "nowrap" }}>
          {formattedDate && <span>Data as of: {formattedDate}</span>}
          {dataSource && (
            <span style={{ marginLeft: spacing.sm }}>
              <strong>Data Source:</strong>{" "}
              <span
                dangerouslySetInnerHTML={{
                  __html: marked.parseInline(dataSource),
                }}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartFooter;
