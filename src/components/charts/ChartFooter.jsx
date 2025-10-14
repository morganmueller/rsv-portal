import React from "react";
import { marked } from "marked";
import { tokens } from "../../styles/tokens";

const { typography, colors, spacing } = tokens;

// Parse "YYYY-MM-DD" as LOCAL midnight; accept Date, timestamp, or other parseables.
function toLocalDate(dLike) {
  if (!dLike) return null;
  if (dLike instanceof Date && !Number.isNaN(dLike.getTime())) return dLike;
  if (typeof dLike === "number") {
    const d = new Date(dLike);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const s = String(dLike);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]); // local midnight
  const d = new Date(s); // fallback
  return Number.isNaN(d.getTime()) ? null : d;
}

const ChartFooter = ({ dataSource, latestDate, footnote }) => {
  const d = toLocalDate(latestDate);
  const formattedDate = d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
        <div
          style={{ flex: 1, fontSize: typography.fontSizeSmall, color: colors.footnoteGray }}
          dangerouslySetInnerHTML={
            footnote ? { __html: marked.parseInline(footnote) } : undefined
          }
        />
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
