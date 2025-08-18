import React from "react";
import { marked } from "marked";
import { tokens } from "../../styles/tokens";

const { typography, colors, spacing } = tokens;

/**
 * ChartFooter displays a latest date and an 
 * optional data source and footnote (both markdown-supported).
 */
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
        fontSize: typography.fontSizeBase,
        color: colors.gray500,
        marginTop: spacing.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        {formattedDate && <span>Data as of: {formattedDate}</span>}
        
        {dataSource && (
          <span>
            <strong>Data Source:</strong>{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: marked.parseInline(dataSource),
              }}
            />
          </span>
        )}
      </div>

      {footnote && (
        <div
          style={{
            marginTop: spacing.xs,
            fontSize: typography.fontSizeSmall,
            color: colors.gray500,
          }}
          dangerouslySetInnerHTML={{ __html: marked.parseInline(footnote) }}
        />
      )}
    </div>
  );
};

export default ChartFooter;
