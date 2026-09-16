/**
 * Apply literal find/replace pairs to a text file, reporting every hit.
 * Usage: node scripts/apply-pairs.mjs <pairs.json> [target]
 * pairs.json: [["find", "replace"], ...]
 */
import fs from "node:fs";

const [pairsFile, targetArg] = process.argv.slice(2);
const pairs = JSON.parse(fs.readFileSync(pairsFile, "utf8"));
const target = targetArg ?? "app/globals.css";
let css = fs.readFileSync(target, "utf8");
let applied = 0;

for (const [find, replace] of pairs) {
  if (!css.includes(find)) {
    console.log(`MISS  ${find.slice(0, 70)}…`);
    continue;
  }
  const occurrences = css.split(find).length - 1;
  css = css.split(find).join(replace);
  applied += 1;
  console.log(`ok    ${occurrences}×  ${find.slice(0, 70)}…`);
}

fs.writeFileSync(target, css);
console.log(`\napplied ${applied}/${pairs.length} pairs, ${target} is now ${css.length} chars`);
