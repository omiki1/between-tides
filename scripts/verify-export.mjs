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
  ["index.html", ["hero", "journal-grid", "projects-grid", "album-modules", "featured-work", "notes-preview", "search-dialog", "home-layout", "profile-card", "font-switch", "time-greeting", "home-intro", "artwork/denia.webp", "artwork/intro/water-sky.webp", "artwork/intro/denia-chibi.webp", "github.com/omiki1", "慢慢发生"]],
  ["anime/index.html", ["anime-board", "anime-grid", "anime-shell", "profile-card", "追番"]],
  ["blog/index.html", ["page-head", "post-table", "category-bar", "journal-grid", "side-rail", "rss.xml"]],
  ["categories/index.html", ["taxonomy-grid", "taxonomy-card", "taxonomy-bar", "side-rail", "/categories/"]],
  ["categories/ai/index.html", ["post-table", "post-table-meta", "side-rail", "换个分类"]],
  ["categories/engineering/index.html", ["post-table", "side-rail", "engineering"]],
  ["tags/index.html", ["tag-cloud", "tag-cloud-item", "tag-index", "side-rail"]],
  ["tags/ai/index.html", ["post-table", "相关标签", "side-rail"]],
  ["tags/docker/index.html", ["post-table", "side-rail", "docker"]],
  ["archive/index.html", ["archive-years", "archive-year-number", "archive-year-head", "category-bar", "start-grid", "side-rail"]],
  ["blog/rag-as-a-map/index.html", ["class=\"prose\"", "katex", "hljs", "reading-progress", "toc", "post-pager", "BlogPosting"]],
  ["projects/index.html", ["project-card", "method-grid", "featured-project", "side-rail", "/projects/mediatlas/", "github.com/omiki1/medical_agentic_rag"]],
  ["projects/mediatlas/index.html", ["class=\"prose\"", "MediAtlas", "Neo4j", "toc", "post-pager", "github.com/omiki1/medical_agentic_rag", "/projects/mediatlas/login.webp", "/projects/mediatlas/answer.webp"]],
  ["projects/disease-graph/index.html", ["class=\"prose\"", "stu-neoj4", "Neo4j"]],
  ["gallery/index.html", ["album-modules", "album-card", "album-credits", "side-rail", "枫桥"]],
  ["gallery/character/index.html", ["gallery-board", "album-summary", "lightbox", "达妮娅"]],
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

/**
 * 每篇文章的断言从 frontmatter 与正文推导，而不是硬编码。
 * 之前这里只检查页面文件是否存在，所以新增文章的封面图缺失时不会报错。
 */
for (const file of posts) {
  const slug = file.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(process.cwd(), "content/posts", file), "utf8");
  const page = path.join(out, "blog", slug, "index.html");

  if (!fs.existsSync(page)) {
    console.log(`MISSING  blog/${slug}/index.html`);
    failures += 1;
    continue;
  }

  const html = fs.readFileSync(page, "utf8");
  const problems = [];

  for (const needle of ["class=\"prose\"", "reading-progress", "toc", "post-pager", "BlogPosting"]) {
    if (!has(html, needle)) problems.push(`缺少 ${needle}`);
  }

  // 封面图必须真的存在于导出产物里 —— 这是最容易漏的一环
  const cover = /^cover:\s*"?([^"\n]+)"?/m.exec(source)?.[1]?.trim();
  if (cover && cover.startsWith("/") && !fs.existsSync(path.join(out, cover.replace(/^\//, "")))) {
    problems.push(`封面图缺失 ${cover}`);
  }

  // 正文里的站内图片同样要落到产物
  for (const match of source.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) {
    const src = match[1];
    if (!fs.existsSync(path.join(out, src.replace(/^\//, "")))) {
      problems.push(`正文图片缺失 ${src}`);
    }
  }

  if (problems.length) {
    console.log(`FAIL     blog/${slug}/index.html → ${problems.join(", ")}`);
    failures += 1;
  } else {
    console.log(`ok       blog/${slug}/index.html`);
  }
}

/** 导出 HTML 里引用的站内静态资源必须都能落到真实文件。 */
const referenced = new Set();
for (const file of fs.readdirSync(out, { recursive: true })) {
  if (!file.endsWith(".html")) continue;
  const html = fs.readFileSync(path.join(out, file), "utf8");
  for (const match of html.matchAll(/(?:src|href)="(\/(?:posts|gallery|artwork|assets|audio|particles)\/[^"]+)"/g)) {
    // 带 # 的是同页锚点（例如 /gallery/character/#starlight-for-you），不是静态文件
    if (match[1].includes("#")) continue;
    referenced.add(match[1]);
  }
}
for (const ref of [...referenced].sort()) {
  if (!fs.existsSync(path.join(out, ref.replace(/^\//, "")))) {
    console.log(`MISSING  ${ref}`);
    failures += 1;
  }
}
console.log(`ok       ${referenced.size} 个站内静态资源引用全部存在`);

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll export checks passed.");
process.exit(failures ? 1 : 0);