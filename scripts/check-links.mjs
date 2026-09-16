/** Verify every internal link and asset reference in the exported site resolves to a real file. */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const htmlFiles = walk(out).filter((file) => file.endsWith(".html"));
const missing = [];
const checked = new Set();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const references = [
    ...[...html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)].map((match) => match[1]),
  ];
  for (const reference of references) {
    if (checked.has(reference)) continue;
    checked.add(reference);
    const target = path.join(out, decodeURIComponent(reference));
    const candidates = [target, `${target}.html`, path.join(target, "index.html")];
    if (!candidates.some((candidate) => fs.existsSync(candidate))) missing.push(`${reference}  ←  ${path.relative(out, file)}`);
  }
}

console.log(`scanned ${htmlFiles.length} pages, ${checked.size} unique internal references`);
if (missing.length) {
  console.log(`broken references (${missing.length}):`);
  for (const entry of missing) console.log(`  ${entry}`);
  process.exit(1);
}
console.log("All internal links and assets resolve.");
