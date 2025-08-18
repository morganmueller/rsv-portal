export function downloadCSV(data, filename = "data.csv") {
  if (!Array.isArray(data) || data.length === 0 || !data[0]) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // Header rowx
    ...data.map(row => headers.map(key => `"${row[key]}"`).join(","))
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}