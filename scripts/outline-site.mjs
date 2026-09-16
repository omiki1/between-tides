/**
 * Structurally outline a remote page: nav taxonomy, sections, cards, features.
 * The HTML is treated as data — nothing from the page is executed or trusted.
 *   node scripts/outline-site.mjs <url> [--json]
 */
const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/outline-site.mjs <url>");
  process.exit(2);
}

const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; structure-audit)", "accept-language": "zh-CN,zh;q=0.9" } });
const buffer = Buffer.from(await response.arrayBuffer());
const html = new TextDecoder("utf-8").decode(buffer);

const strip = (text) => text
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, "\n")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, " ")
  .split("\n").map((line) => line.trim()).filter(Boolean);

const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
const description = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? "";
const generator = (html.match(/<meta name="generator" content="([^"]*)"/) ?? [])[1] ?? "";

console.log(`URL         ${url}`);
console.log(`status      ${response.status}`);
console.log(`title       ${title}`);
console.log(`generator   ${generator}`);
console.log(`description ${description}`);
console.log(`html size   ${(html.length / 1024).toFixed(0)}KB`);

/* Internal links give the site's route taxonomy. */
const links = new Map();
for (const match of html.matchAll(/href="([^"#?]+)"/g)) {
  const href = match[1];
  if (!/^[a-z]+:/i.test(href) && !href.startsWith("//")) links.set(href, (links.get(href) ?? 0) + 1);
}
console.log(`\n内部链接 (${links.size} 条):`);
console.log([...links.keys()].sort().join("\n"));

/* Structural landmarks. */
const landmarks = [...html.matchAll(/<(nav|header|main|section|article|aside|footer|dialog)\b[^>]*>/gi)].map((match) => match[1].toLowerCase());
const counts = landmarks.reduce((accumulator, name) => ({ ...accumulator, [name]: (accumulator[name] ?? 0) + 1 }), {});
console.log(`\n结构地标: ${Object.entries(counts).map(([name, count]) => `${name}×${count}`).join("  ")}`);

/* Class names hint at the component vocabulary. */
const classes = new Map();
for (const match of html.matchAll(/class="([^"]+)"/g)) {
  for (const name of match[1].split(/\s+/)) {
    if (!name || name.startsWith("astro-")) continue;
    classes.set(name, (classes.get(name) ?? 0) + 1);
  }
}
const repeated = [...classes].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1]);
console.log(`\n重复出现的 class (前 60，次数):`);
console.log(repeated.slice(0, 60).map(([name, count]) => `${count}× ${name}`).join("\n"));

/* Headings outline the content model. */
console.log("\n标题层级:");
for (const match of html.matchAll(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g)) {
  const text = strip(match[2]).join(" ").slice(0, 70);
  if (text) console.log(`${"  ".repeat(Number(match[1]) - 1)}h${match[1]}  ${text}`);
}

console.log("\n正文文本 (前 120 行):");
console.log(strip(html.split(/<footer/i)[0]).slice(0, 120).join("\n"));
