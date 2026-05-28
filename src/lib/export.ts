export type CsvRow = Record<string, string | number | boolean | null | undefined>;

function csvCell(value: CsvRow[string]) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(rows: CsvRow[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(";"),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";")),
  ].join("\n");
}

export function downloadCsv(filename: string, rows: CsvRow[]) {
  if (typeof window === "undefined") return;
  const csv = toCsv(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
