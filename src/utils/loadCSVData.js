import { csvParse } from "d3-dsv";

export async function loadCSVData(url) {
  const response = await fetch(url);
  const text = await response.text();

  return csvParse(text, (row) => {
    const numeric = parseFloat(row.value);
    return {
      ...row,
      date: new Date(row.date),
      valueRaw: row.value, 
      value: isNaN(numeric) ? null : numeric,
      submetric: row.submetric?.trim(), 
      display: row.display?.trim(),     
    };
  });
}
