// A small CSV reader. CSV = a text file where each line is a row and commas split the columns.
// It is used by the website (usePrograms.js reads public/programs.csv) and by the script
// scripts/makePrograms.mjs (which reads the big catalog in data/assistance-listings.csv).
//
// Tricky parts of CSV that this handles:
//   - a field in "quotes" can contain commas:        "Rent, food"
//   - a quote inside quotes is doubled:               "She said ""hi"""
//   - a quoted field can even contain line breaks
//
// parseCsv("a,b\n1,2") gives [{ a: "1", b: "2" }]  (one object per row, keyed by the header line)
export function parseCsv(text) {
  // some files start with an invisible mark (BOM); skip it
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = []; // all rows so far, each one a list of fields
  let row = []; // the row being read
  let field = ""; // the field being read
  let quoted = false; // are we inside "quotes" right now?

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"'; // two quotes in a row = one real quote
          i++;
        } else {
          quoted = false; // the closing quote
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field); // a comma ends the field
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++; // Windows line end is two characters
      row.push(field); // a line break ends the field and the row
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field); // the last row may have no line break after it
    rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];
  // The catalog's column names end in a field number like "Objectives (050)". Remove it.
  const names = header.map((h) => h.replace(/\s*\(\d+\)\s*$/, "").trim());
  return body
    .filter((r) => r.length > 1) // skip empty lines
    .map((r) => Object.fromEntries(names.map((n, i) => [n, r[i] ?? ""])));
}
