/**
 * Deep integrity check for globals.css: brace balance, dangling combinators,
 * empty selectors, and stray digits before a selector (dev-server artifacts).
 *   node scripts/check-css.mjs [file]
 */
import fs from "node:fs";

const file = process.argv[2] ?? "app/globals.css";
const css = fs.readFileSync(file, "utf8");
const problems = [];

/* 1. Brace balance with line numbers. */
let depth = 0;
let line = 1;
let openLine = 1;
for (const character of css) {
  if (character === "\n") line += 1;
  if (character === "{") {
    if (depth === 0) openLine = line;
    depth += 1;
  }
  if (character === "}") {
    depth -= 1;
    if (depth < 0) problems.push(`line ${line}: unexpected closing brace`);
  }
}
if (depth > 0) problems.push(`unclosed block starting around line ${openLine} (depth ${depth})`);

/* 2. Selector sanity, evaluated per line so multi-line files do not create false positives. */
const lines = css.split("\n");
lines.forEach((text, index) => {
  const lineNumber = index + 1;
  for (const match of text.matchAll(/([^{}]*)\{/g)) {
    const selector = match[1].trim();
    if (!selector) {
      problems.push(`line ${lineNumber}: empty selector`);
      continue;
    }
    if (/[>+~]$/.test(selector)) problems.push(`line ${lineNumber}: dangling combinator → "${selector.slice(-40)}"`);
    if (/(?:^|\s)(?:\.light|\.dark)\s*@media/.test(selector)) problems.push(`line ${lineNumber}: stray fragment before @media → "${selector.slice(0, 40)}"`);
    /* An at-rule must stand alone: any selector text glued in front of it is a leftover fragment. */
    const glued = /[^\s{};,]@(?:keyframes|media|supports|layer|import)\b/.exec(selector);
    if (glued) problems.push(`line ${lineNumber}: stray text before @-rule → "${selector.slice(Math.max(0, glued.index - 30), glued.index + 20)}"`);
    if (/(^|[};])\d{2,7}\.[a-zA-Z]/.test(selector)) problems.push(`line ${lineNumber}: stray digits before class → "${selector.slice(0, 40)}"`);
    if (!selector.startsWith("@") && /@media/.test(selector)) problems.push(`line ${lineNumber}: nested @media inside selector → "${selector.slice(0, 60)}"`);
  }
});

/* 3. Duplicate declarations inside one rule. */
for (const match of css.matchAll(/\{([^{}]*)\}/g)) {
  const body = match[1];
  const seen = new Set();
  for (const declaration of body.split(";")) {
    if (!declaration.includes(":")) continue;
    const property = declaration.split(":")[0]?.trim();
    if (!property) continue;
    if (seen.has(property)) {
      const at = css.slice(0, match.index).split("\n").length;
      problems.push(`line ${at}: duplicate property "${property}"`);
    }
    seen.add(property);
  }
}

console.log(`checked ${file}: ${css.length} chars, ${lines.length} lines`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 40)) console.log(`  ${problem}`);
  process.exit(1);
}
console.log("no structural problems found");
