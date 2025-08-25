// utils/downloadUtils.js
export function downloadCSV(rows, filename = "data.csv") {
  if (!Array.isArray(rows) || rows.length === 0) return;

  // Build header from union of keys across all rows (not just the first)
  const headerSet = new Set();
  for (const r of rows) Object.keys(r || {}).forEach((k) => headerSet.add(k));
  const headers = Array.from(headerSet);

  // Escape CSV fields: wrap in quotes, double inner quotes
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.join(","), // header row
    ...rows.map((r) => headers.map((h) => esc(r?.[h])).join(",")),
  ].join("\n");

  // Add BOM so Excel opens UTF-8 correctly
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke on the next tick to avoid aborting the download in some browsers
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// Filename helpers
export const slugify = (s = "") =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "");

export const formatDateForFile = (isoLike) => {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Build names like "virus-metric-category-date.ext"
 * e.g. "influenza-visits-bronx-2025-01-05.csv"
 *
 * - If `virus` is falsy (e.g., the overview page), falls back to "overview"
 * - Set `includeMetric=false` to omit the metric (e.g., cases/deaths exports)
 */
export const buildDownloadName = ({
  virus,
  metric,
  category,
  date, // ISO-like string or Date
  ext = "csv",
  includeMetric = true,
  fallbackVirus = "overview",
}) => {
  const virusPart = slugify(virus) || slugify(fallbackVirus);
  const metricPart = includeMetric ? slugify(metric || "") : "";
  const categoryPart = slugify(category || "");
  const datePart = slugify(formatDateForFile(date));
  const cleanExt = String(ext || "csv").replace(/^\./, "");

  const parts = [virusPart, metricPart, categoryPart, datePart].filter(Boolean);
  return `${parts.join("-") || "download"}.${cleanExt}`;
};
