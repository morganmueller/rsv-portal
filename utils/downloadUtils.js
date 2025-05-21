
export function downloadCSV(data, filename = "data.csv") {
    if (!data || data.length === 0) return;
  
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","), // Header row
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
  