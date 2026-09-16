/**
 * Static export smoke test.
 * Run `next build` first, then `node scripts/verify-export.mjs`.
 * Checks that every exported page exists and still contains the features it promises.
 */
import fs from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "out");
const read = (file) => fs.readFileSync(path.join(out, file), "utf8");
const has = (haystack, needle) => haystack.includes(needle);

const expectations = [
  ["index.html", ["hero", "journal-grid", "projects-grid", "album-modules", "featured-work", "notes-preview", "search-dialog", "home-layout", "profile-card", "font-switch", "time-greeting", "home-intro", "artwork/denia.webp", "artwork/intro/water-sky.webp", "artwork/intro/denia-chibi.webp", "github.com/omiki1"]],
  ["anime/index.html", ["anime-board", "anime-grid", "anime-shell", "profile-card", "追番"]],
  ["blog/index.html", ["page-head", "post-table", "category-bar", "journal-grid", "side-rail", "rss.xml"]],
  ["categories/index.html", ["taxonomy-grid", "taxonomy-card", "taxonomy-bar", "side-rail", "/categories/"]],
  ["categories/ai/index.html", ["post-table", "post-table-meta", "side-rail", "换个分类"]],
  ["tags/index.html", ["tag-cloud", "tag-cloud-item", "tag-index", "side-rail"]],
  ["tags/ai/index.html", ["post-table", "相关标签", "side-rail"]],
  ["archive/index.html", ["archive-years", "archive-year-number", "archive-year-head", "category-bar", "start-grid", "side-rail"]],
  ["blog/rag-as-a-map/index.html", ["class=\"prose\"", "katex", "hljs", "reading-progress", "toc", "post-pager", "BlogPosting"]],
  ["projects/index.html", ["project-card", "method-grid", "featured-project", "side-rail", "/projects/mediatlas/", "github.com/omiki1/medical_agentic_rag"]],
  ["projects/mediatlas/index.html", ["class=\"prose\"", "MediAtlas", "不是诊疗工具", "toc", "post-pager", "github.com/omiki1/medical_agentic_rag"]],
  ["projects/disease-graph/index.html", ["class=\"prose\"", "stu-neoj4", "Neo4j"]],
  ["gallery/index.html", ["album-modules", "album-card", "album-credits", "side-rail", "风景壁纸"]],
  ["gallery/character/index.html", ["gallery-board", "album-summary", "lightbox", "群星，因你闪耀"]],
  ["gallery/maple/index.html", ["gallery-board", "枫桥"]],
  ["notes/index.html", ["notes-timeline", "now-strip", "timeline-dot", "side-rail"]],
  ["about/index.html", ["about-identity", "interest-grid", "about-facts", "start-grid", "side-rail"]],
  ["404.html", ["404 / NOT FOUND", "notfound-links"]],
  ["search.json", ["\"kind\":\"文章\"", "\"kind\":\"随记\"", "\"kind\":\"项目\"", "\"kind\":\"图集\"", "\"kind\":\"追番\""]],
  ["rss.xml", ["<rss version=\"2.0\"", "<item>", "rag-as-a-map"]],
  ["sitemap.xml", ["<urlset", "/blog/rag-as-a-map/", "/anime/"]],
  ["robots.txt", ["Sitemap:"]],
];

let failures = 0;
for (const [file, needles] of expectations) {
  const target = path.join(out, file);
  if (!fs.existsSync(target)) {
    console.log(`MISSING  ${file}`);
    failures += 1;
    continue;
  }
  const content = read(file);
  const missing = needles.filter((needle) => needle && !has(content, needle));
  if (missing.length) {
    console.log(`FAIL     ${file} → ${missing.join(", ")}`);
    failures += 1;
  } else {
    console.log(`ok       ${file}`);
  }
}

const posts = fs.readdirSync(path.join(process.cwd(), "content/posts")).filter((file) => file.endsWith(".md"));
const slugs = posts.map((file) => file.replace(/\.md$/, ""));
for (const slug of slugs) {
  const page = path.join(out, "blog", slug, "index.html");
  if (!fs.existsSync(page)) {
    console.log(`MISSING  blog/${slug}/index.html`);
    failures += 1;
  } else {
    console.log(`ok       blog/${slug}/index.html`);
  }
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll export checks passed.");
process.exit(failures ? 1 : 0);