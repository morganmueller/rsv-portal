import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import "./DownloadPreviewTable.css";

// --- helpers ---
const isDateLike = (v) =>
  v instanceof Date ||
  (v && typeof v === "object" && typeof v.getTime === "function" && !Number.isNaN(v.getTime()));

const isNumericLike = (v) =>
  typeof v === "number" ||
  (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)));

const toCellText = (v) => {
  if (v == null) return ""; // null/undefined -> empty cell
  if (isDateLike(v)) {
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
  if (typeof v === "number" && !Number.isFinite(v)) return "";
  return String(v);
};

const compareValues = (a, b) => {
  if (isDateLike(a) && isDateLike(b)) return new Date(a) - new Date(b);
  if (isNumericLike(a) && isNumericLike(b)) return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
};

const DownloadPreviewTable = ({ data = [], columnLabels = {}, maxRows = 100, pageSize = 5 }) => {
  // derive full column set from all rows (not just the first)
  const columns = useMemo(() => {
    const set = new Set();
    (data || []).forEach((row) => Object.keys(row || {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [data]);

  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const handleSort = (column) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortAsc((prevAsc) => !prevAsc);
        return prev;
      }
      setSortAsc(true);
      return column;
    });
    setPage(0);
  };

  const baseData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const sorted = useMemo(() => {
    if (!sortBy) return baseData;
    return [...baseData].sort((a, b) => {
      const aVal = a?.[sortBy];
      const bVal = b?.[sortBy];
      const cmp = compareValues(aVal, bVal);
      return sortAsc ? cmp : -cmp;
    });
  }, [baseData, sortBy, sortAsc]);

  const limited = useMemo(() => sorted.slice(0, maxRows), [sorted, maxRows]);
  const totalPages = Math.max(1, Math.ceil(limited.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = useMemo(
    () => limited.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    [limited, currentPage, pageSize]
  );

  if (!columns.length) return null;

  return (
    <div className="preview-table-wrapper">
      <table className="preview-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} onClick={() => handleSort(col)}>
                {columnLabels[col] || col}
                {sortBy === col ? (sortAsc ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col}>{toCellText(row?.[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={currentPage === 0} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

DownloadPreviewTable.propTypes = {
  data: PropTypes.array.isRequired,
  columnLabels: PropTypes.object,
  maxRows: PropTypes.number,
  pageSize: PropTypes.number,
};

export default DownloadPreviewTable;
