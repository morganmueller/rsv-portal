import React, { useId, useState, useMemo } from "react";
import PropTypes from "prop-types";
import "./AccessibleTable.css";

const interpolate = (str, variables = {}) =>
  typeof str === "string"
    ? str.replace(/{(\w+)}/g, (_, k) => (variables[k] ?? `{${k}}`))
    : str;


const decidePercentScale = (num, row, col) => {
  const colScale = (col?.scale || "auto").toLowerCase();
  if (colScale === "hundred") return "hundred";
  if (colScale === "unit") return "unit";

  const disp = String(row?.display || "").toLowerCase();
  if (disp.startsWith("percent")) return "hundred";

  const headerText = String(col?.header || "").toLowerCase();
  if (headerText.includes("percent") || headerText.includes("%")) {
    return "hundred";
  }

  // Heuristic fallback
  return Math.abs(num) > 1 ? "hundred" : "unit";
};

/** Parse a percent-ish input to a Number */
const coerceNumber = (v) => {
  if (v == null || v === "") return null;
  let s = typeof v === "string" ? v.trim() : v;
  if (typeof s === "string" && s.endsWith("%")) s = s.slice(0, -1);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/**
 * Choose fraction digits for small percentages.
 * Defaults: 1 dp; <0.01% → 2 dp; <0.001% → 3 dp.
 * Overridable via col.maxFractionDigits / col.minFractionDigits.
 */
const choosePercentDigits = (valueUnitScale, col) => {
  // Allow explicit override on the column
  const hasMax = Number.isFinite(col?.maxFractionDigits);
  const hasMin = Number.isFinite(col?.minFractionDigits);
  if (hasMax || hasMin) {
    return {
      maximumFractionDigits: hasMax ? col.maxFractionDigits : 1,
      minimumFractionDigits: hasMin ? col.minFractionDigits : 0,
    };
  }

  // Adaptive: valueUnitScale is 0–1 (e.g., 0.0005 = 0.05%)
  const abs = Math.abs(valueUnitScale);
  let maximumFractionDigits = 1;
  if (abs < 0.001) maximumFractionDigits = 3; // <0.1% needs 3 dp
  else if (abs < 0.01) maximumFractionDigits = 2; // <1% needs 2 dp

  return { maximumFractionDigits, minimumFractionDigits: 0 };
};

/**
 * Format percent based on row/column context.
 * - "hundred" → divide by 100 before Intl percent format
 * - "unit"    → use as-is (assumed 0–1)
 * Uses adaptive fraction digits so tiny values like 0.05% don't round up to 0.1%
 */
const formatPercentSmart = (v, row, col) => {
  const raw = coerceNumber(v);
  if (raw == null) return "";

  const scale = decidePercentScale(raw, row, col);
  const valueForIntl = scale === "hundred" ? raw / 100 : raw;

  const digits = choosePercentDigits(valueForIntl, col);

  return new Intl.NumberFormat(undefined, {
    style: "percent",
    ...digits,
  }).format(valueForIntl);
};

/**
 * AccessibleTable
 * - Semantic HTML table for screen readers
 * - Hidden visually by default (srOnly = true)
 * - Optional toggle for sighted users
 */
export default function AccessibleTable({
  data = [],
  columns = [],
  caption,
  variables = {},
  srOnly = true,
  labelledBy,
  allowToggleForSighted = true,
  initialOpen = false,
}) {
  const tableId = useId();
  const [open, setOpen] = useState(initialOpen);

  const safeCols = useMemo(() => {
    if (columns?.length) return columns;
    const keys = data?.[0] ? Object.keys(data[0]) : [];
    return keys.map((k) => ({ key: k, header: k, format: "text" }));
  }, [columns, data]);

  /** Formatters (each receives value, row, col) */
  const fmt = useMemo(
    () => ({
      text: (v) => (v ?? "").toString(),
      number: (v) =>
        v == null || v === "" ? "" : new Intl.NumberFormat().format(+v),
      percent: (v, row, col) => formatPercentSmart(v, row, col),
      date: (v) => (v ? new Date(v).toLocaleDateString() : ""),
      passthrough: (v) => v,
    }),
    []
  );

  const className =
    srOnly && !open ? "screenreader-only" : "accessible-table-wrapper";

  return (
    <div className={className}>
      {allowToggleForSighted && srOnly && (
        <button
          type="button"
          className="accessible-table-toggle"
          aria-expanded={open}
          aria-controls={tableId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide data table" : "Show data table"}
        </button>
      )}

      <table id={tableId} className="accessible-table" aria-labelledby={labelledBy}>
        {caption && <caption>{interpolate(caption, variables)}</caption>}
        <thead>
          <tr>
            {safeCols.map((c) => (
              <th key={c.key} scope="col">
                {interpolate(c.header, variables)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, i) => (
            <tr key={i}>
              {safeCols.map((c) => {
                const f = fmt[c.format] || fmt.text;
                return <td key={c.key}>{f(row?.[c.key], row, c)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

AccessibleTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      format: PropTypes.oneOf([
        "text",
        "number",
        "percent",
        "date",
        "passthrough",
      ]),

      scale: PropTypes.oneOf(["hundred", "unit", "auto"]),
      maxFractionDigits: PropTypes.number,
      minFractionDigits: PropTypes.number,
    })
  ),
  caption: PropTypes.string,
  variables: PropTypes.object,
  srOnly: PropTypes.bool,
  labelledBy: PropTypes.string,
  allowToggleForSighted: PropTypes.bool,
  initialOpen: PropTypes.bool,
};
