/** Cross-check component class names against the stylesheet so no page renders unstyled. */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1]));

/** Classes that are intentionally style-free (semantics or Tailwind-style hooks). */
const allowed = new Set(["light", "dark", "active", "playing", "resonating", "single-column"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" || entry.name === ".next" || entry.name === "out" ? [] : walk(target);
    return /\.(tsx|ts)$/.test(entry.name) ? [target] : [];
  });
}

const used = new Map();
for (const file of walk(path.join(root, "app")).concat(walk(path.join(root, "components")))) {
  const source = fs.readFileSync(file, "utf8");
  const literals = [...source.matchAll(/(?:className=|class=)(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/g)];
  for (const match of literals) {
    const value = match[1] ?? match[2] ?? match[3] ?? "";
    for (const name of value.split(/[\s${}?:]+/)) {
      const clean = name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (clean && /^[a-zA-Z]/.test(clean)) used.set(clean, file);
    }
  }
}

const orphans = [...used.entries()].filter(([name]) => !defined.has(name) && !allowed.has(name));
if (!orphans.length) console.log("All component classes have stylesheet rules.");
for (const [name, file] of orphans) console.log(`UNSTYLED  .${name}  ←  ${path.relative(root, file)}`);

const unused = [...defined].filter((name) => !used.has(name) && !["katex", "hljs", "light", "dark"].includes(name));
console.log(`\ndefined: ${defined.size}, referenced: ${used.size}, unstyled: ${orphans.length}, unused rules: ${unused.length}`);
if (unused.length) console.log(`unused: ${unused.join(", ")}`);
