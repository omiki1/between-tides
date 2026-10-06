#!/usr/bin/env node
/**
 * 构建后生成 Pagefind 搜索索引：读取 out/ 里导出的 HTML，写到 out/pagefind/。
 *
 * - 只索引带 data-pagefind-body 的内容区（layout 里包住页面主体的那层），导航、音乐面板、侧栏都在外面或带 data-pagefind-ignore。
 * - 列表页（首页、/blog/、归档、分类、标签……）只是详情页的重复摘要，不进正文索引，避免同一篇文章出现多次。
 * - 每条结果带 section 过滤字段（文章 / 项目 / 相册 / 随记 / 追番 / 页面），前端按它分组。
 * - 没有独立页面的条目（每部番、每张图、每条随记）从 out/search.json 里补成自定义记录。
 *
 * 用法：npm run build（next build 之后自动执行），或单独 node scripts/build-search.mjs
 */
import * as pagefind from "pagefind";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(process.argv[2] || "out");
const sectionOf = (url) =>
  url.startsWith("/blog/") && url !== "/blog/" ? "文章" :
  url.startsWith("/projects/") && url !== "/projects/" ? "项目" :
  url.startsWith("/gallery/") ? "相册" :
  url.startsWith("/notes/") ? "随记" :
  url.startsWith("/anime/") ? "追番" : "页面";
const SKIP = [/^\/$/, /^\/blog\/$/, /^\/archive\/$/, /^\/categories\//, /^\/tags\//, /^\/anime\/$/, /^\/projects\/$/, /^\/gallery\/$/, /^\/404\/$/, /^\/_not-found\//];

function tune(html, url) {
  const section = sectionOf(url);
  const date = (html.match(/"datePublished":"([^"]+)"/) || [])[1];
  let attrs = `data-pagefind-filter="section:${section}"`;
  if (date) attrs += ` data-pagefind-meta="date:${date}" data-pagefind-sort="date:${date}"`;
  let h = html.replace("data-pagefind-body", `data-pagefind-body ${attrs}`);
  // 结果标题用页面自己的 h1，不带「 · 幻想收束点」后缀
  h = h.replace(/<h1(?=[\s>])/, '<h1 data-pagefind-meta="title"');
  return h;
}

async function walk(dir, files = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!["_next", "pagefind"].includes(entry.name)) await walk(p, files); }
    else if (entry.name === "index.html") files.push(p);
  }
  return files;
}

const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error(`pagefind: ${errors.join("; ")}`);
let pages = 0, records = 0;
for (const file of await walk(OUT)) {
  const rel = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
  const url = rel ? `/${rel}/` : "/";
  if (SKIP.some((r) => r.test(url))) continue;
  const html = await fs.readFile(file, "utf8");
  if (!html.includes("data-pagefind-body")) continue;
  const result = await index.addHTMLFile({ url, content: tune(html, url) });
  if (result.errors?.length) console.warn(`[search] ${url}:`, result.errors.join("; ")); else pages++;
}

// 没有独立页面的条目：每部番、每张图、每条随记
let entries = [];
try { entries = JSON.parse(await fs.readFile(path.join(OUT, "search.json"), "utf8")); } catch { console.warn("[search] out/search.json 不存在，跳过自定义记录"); }
for (const x of entries) {
  if (!["追番", "图集", "随记"].includes(x.kind)) continue;
  if (x.kind === "图集" && !x.href.includes("#")) continue;
  const section = x.kind === "图集" ? "相册" : x.kind;
  await index.addCustomRecord({
    url: x.kind === "追番" ? `/anime/?q=${encodeURIComponent(x.title)}` : x.href,
    content: x.kind === "随记" ? x.excerpt : `${x.title.replace(/^相册 · /, "")}。${x.excerpt || ""}`,
    language: "zh-cn",
    meta: { title: x.kind === "随记" ? `随记 · ${x.title}` : x.title.replace(/^相册 · /, "") },
    filters: { section: [section] },
  });
  records++;
}

await fs.rm(path.join(OUT, "pagefind"), { recursive: true, force: true });
const written = await index.writeFiles({ outputPath: path.join(OUT, "pagefind") });
if (written.errors?.length) throw new Error(written.errors.join("; "));
await pagefind.close();
console.log(`[search] Pagefind 索引完成：${pages} 个页面 + ${records} 条自定义记录 → out/pagefind/`);
