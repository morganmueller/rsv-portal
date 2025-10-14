// src/utils/loadCSVData.js
import { csvParse } from "d3-dsv";

/** Parse "YYYY-MM-DD" as LOCAL midnight (avoid UTC shifting a day). */
function parseLocalISO(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]); // <-- LOCAL date
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;      // fallback for other formats
}

export async function loadCSVData(url) {
  const response = await fetch(url);
  const text = await response.text();

  return csvParse(text, (row) => {
    const valueNum = Number(row.value);
    const dateStr = (row.date ?? row.week ?? "").trim(); // keep whatever your CSV calls it
    const date = parseLocalISO(dateStr);

    return {
      ...row,
      dateStr,                 // raw CSV string preserved for downloads/labels
      date,                    // SAFE local Date for charts/sorting
      valueRaw: row.value,     // original numeric text
      value: Number.isFinite(valueNum) ? valueNum : null,
      submetric: row.submetric?.trim(),
      display: row.display?.trim(),
    };
  });
}
