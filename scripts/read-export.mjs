/** Inspect exported pages: text, raw slices, and small structural assertions. */
import fs from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "out");
const [file = "blog/rag-as-a-map/index.html", mode = "text", extra = ""] = process.argv.slice(2);
const html = fs.readFileSync(path.join(out, file), "utf8");

if (mode === "raw") {
  const index = html.indexOf(extra || "prose");
  console.log(index < 0 ? `"${extra}" not found` : html.slice(Math.max(0, index - 200), index + 1600));
} else if (mode === "summary") {
  const images = [...html.matchAll(/<img [^>]*>/g)].map((match) => match[0]);
  console.log(`${file}: ${html.length} chars, ${images.length} <img>, ${(html.match(/<h[123][ >]/g) ?? []).length} headings`);
  console.log(`preload link: ${/rel="preload"[^>]*as="image"/.test(html)}`);
  console.log(`priority attribute: ${/priority/.test(html)}`);
  for (const image of images.slice(0, 4)) console.log(`  ${image.slice(0, 200)}`);
} else {
  const body = html.split("<body")[1] ?? html;
  const text = body
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&nbsp;/g, " ")
    .split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
  console.log(text);
}
