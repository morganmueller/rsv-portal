import { csvParse } from "d3-dsv";

/**
 * Fetches and parses a CSV file into JSON using d3-dsv.
 * Handles quoted strings, commas inside fields, etc.
 * Returns: Array of objects with keys from header.
 */
export async function loadCSVData(url) {
  const response = await fetch(url);
  const text = await response.text();
  return csvParse(text); // auto-handles header + value parsing
}
