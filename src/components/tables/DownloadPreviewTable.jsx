import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import "./DownloadPreviewTable.css";

const DownloadPreviewTable = ({ data, columnLabels = {}, maxRows = 100 }) => {
  const columns = useMemo(() => Object.keys(data[0] || {}), [data]);

  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const handleSort = (column) => {
    setSortBy(column);
    setSortAsc(prev => column === sortBy ? !prev : true);
  };

  const handleFilter = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setPage(0);
  };

  const filtered = useMemo(() => {
    return data.filter(row =>
      columns.every(col =>
        filters[col] ? row[col]?.toString().toLowerCase().includes(filters[col].toLowerCase()) : true
      )
    );
  }, [data, columns, filters]);

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortBy, sortAsc]);

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sorted.length / pageSize);

  return (
    <div className="preview-table-wrapper">
      <table className="preview-table">
      <thead>
      <tr>
        {columns.map(col => (
          <th key={col} onClick={() => handleSort(col)}>
            {columnLabels[col] || col}
            {sortBy === col ? (sortAsc ? " ▲" : " ▼") : ""}
          </th>
        ))}
      </tr>
          <tr>
            {columns.map(col => (
              <th key={col + "-filter"}>
                <input
                  className="filter-input"
                  type="text"
                  value={filters[col] || ""}
                  onChange={(e) => handleFilter(col, e.target.value)}
                  placeholder="Filter"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, i) => (
            <tr key={i}>
              {columns.map(col => <td key={col}>{row[col]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};

DownloadPreviewTable.propTypes = {
  data: PropTypes.array.isRequired,
  maxRows: PropTypes.number,
};

export default DownloadPreviewTable;
