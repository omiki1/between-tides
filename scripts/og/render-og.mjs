#!/usr/bin/env node
/**
 * 分享图（Open Graph / Twitter 大图卡片）生成器：HTML 模板 + Playwright 截图，1200×630 PNG。
 *
 *   npm run og            生成 public/og/home.png 和知识图谱系列每篇一张 public/og/<slug>.png
 *   npm run og -- --only home|kg-03-knowledge-extraction
 *
 * - 角色立绘只用仓库里已有的 Kuro Games 官方图抠图（public/artwork/denia.webp：官方角色资料图；
 *   public/artwork/denia/face-circle-320.webp：官方角色资料图头像区），不用任何 AI 生成图；
 *   泡泡、星点、光晕都是代码画的。右下角注明「角色立绘 © Kuro Games」。
 * - 标题用文楷子集（styles/generated/wenkai-subset.woff2，构建时生成；这里会先确保它存在），
 *   其余小字用系统中文字体。
 * - 系列编号与站内「第 N/9 篇」一致：按 slug 里的数字排序后从 1 开始（kg-00 是第 1/9 篇），逻辑同 lib/series.ts。
 * - 截图后用 sharp 压成调色板 PNG，每张控制在 ~300 KB 以内。
 * 需要 Playwright（npx playwright 或 devDependency）和本机 Chrome：chromium.launch({ channel: "chrome" })。
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const OUT = path.join(ROOT, "public", "og");
const SITE = { name: "幻想收束点", wordmark: "CONVERGENCE", url: "omiki.cc", description: "在代码、音乐和世界之间，记录一些没有答案的问题。", tagline: "散落的念头，会在这里收束。" };
const SERIES = { name: "知识图谱", pattern: /^kg-(\d+)-/ };
const MAX_BYTES = 300 * 1024;

const only = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : null; })();

// ---------- 素材 ----------
const dataUrl = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(ROOT, file)).toString("base64")}`;
const subsetFont = path.join(ROOT, "styles", "generated", "wenkai-subset.woff2");
if (!fs.existsSync(subsetFont)) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "wenkai", "run.mjs"), "build"], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
const ART_FULL = dataUrl("public/artwork/denia.webp", "image/webp");
const ART_FACE = dataUrl("public/artwork/denia/face-circle-320.webp", "image/webp");
const WENKAI = `data:font/woff2;base64,${fs.readFileSync(subsetFont).toString("base64")}`;

// ---------- 数据 ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const posts = fs.readdirSync(path.join(ROOT, "content", "posts")).filter(f => f.endsWith(".md")).map(f => {
  const { data } = matter(fs.readFileSync(path.join(ROOT, "content", "posts", f), "utf8"));
  return { slug: f.slice(0, -3), title: String(data.title), description: String(data.description || ""), tags: (data.tags || []).map(String) };
});
const series = posts
  .map(p => ({ p, m: SERIES.pattern.exec(p.slug) }))
  .filter(x => x.m)
  .sort((a, b) => Number(a.m[1]) - Number(b.m[1]) || a.p.slug.localeCompare(b.p.slug))
  .map(({ p }, i, all) => ({ ...p, index: i + 1, total: all.length }));

// ---------- 模板 ----------
/* 确定性的伪随机：每张图的泡泡位置固定，重跑结果一致 */
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function bubbles(seed, n, area) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const size = 10 + r() * 58, x = area.x + r() * area.w, y = area.y + r() * area.h, o = .35 + r() * .5;
    out += `<i class="bubble" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;opacity:${o.toFixed(2)}"></i>`;
  }
  return out;
}
function stars(seed, n) {
  const r = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) out += `<circle cx="${(r() * 1200).toFixed(0)}" cy="${(r() * 630).toFixed(0)}" r="${(0.6 + r() * 1.6).toFixed(1)}" fill="${r() > .5 ? "#ffffff" : "#ffe1ee"}" opacity="${(.35 + r() * .5).toFixed(2)}"/>`;
  return `<svg class="stars" width="1200" height="630" viewBox="0 0 1200 630">${out}</svg>`;
}

const BASE_CSS = `
@font-face{font-family:"WK";src:url(${WENKAI}) format("woff2")}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC",sans-serif;color:#2c2140;
  background:
    radial-gradient(520px 380px at 88% 18%,rgba(246,168,200,.55),transparent 70%),
    radial-gradient(560px 420px at 8% 92%,rgba(156,200,242,.6),transparent 72%),
    radial-gradient(420px 300px at 50% 0%,rgba(207,190,255,.35),transparent 70%),
    linear-gradient(135deg,#fff4f8 0%,#f6eefb 46%,#e9f1fd 100%)}
.stars{position:absolute;inset:0;mix-blend-mode:normal}
.ring{position:absolute;border-radius:50%;border:1.5px solid rgba(232,138,178,.28)}
.ring.blue{border-color:rgba(120,170,230,.28)}
.bubble{position:absolute;border-radius:50%;
  background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.95) 0 12%,rgba(255,255,255,.18) 26%,rgba(255,255,255,0) 55%),
    radial-gradient(circle at 50% 50%,rgba(255,255,255,0) 58%,rgba(246,168,200,.45) 74%,rgba(156,200,242,.55) 88%,rgba(255,255,255,.75) 97%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.7)}
.wave{position:absolute;left:0;right:0;bottom:0;height:120px}
.brand{font-family:"WK",serif;letter-spacing:4px}
.wordmark{font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;font-weight:600;letter-spacing:7px;font-size:15px;color:#9a7fb0}
.credit{position:absolute;right:26px;bottom:18px;font-size:13px;color:rgba(60,42,80,.6);letter-spacing:1px;
  padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.55)}
.url{font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;font-size:20px;letter-spacing:2px;color:#7a6496}
.chip{display:inline-flex;align-items:center;gap:10px;padding:8px 18px;border-radius:999px;font-size:21px;letter-spacing:2px;
  color:#fff;background:linear-gradient(96deg,#e88ab2,#a99af0 55%,#79b4ea);box-shadow:0 8px 24px rgba(232,138,178,.35)}
`;
const WAVE = `<svg class="wave" viewBox="0 0 1200 120" preserveAspectRatio="none"><defs><linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="#f6a8c8"/><stop offset=".5" stop-color="#c3b2f5"/><stop offset="1" stop-color="#9cc8f2"/></linearGradient></defs>
<path d="M0 78 C150 48 300 108 450 78 S750 48 900 78 S1100 100 1200 70" stroke="url(#w)" stroke-width="2.4" fill="none" opacity=".75"/>
<path d="M0 96 C170 70 320 120 480 94 S780 66 930 96 S1110 112 1200 90" stroke="url(#w)" stroke-width="1.2" fill="none" opacity=".5"/></svg>`;

function homeHtml() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${BASE_CSS}
.art{position:absolute;right:28px;top:-6px;height:700px;filter:drop-shadow(0 18px 40px rgba(170,110,160,.35))}
.halo{position:absolute;right:70px;top:70px;width:440px;height:440px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.95) 0 30%,rgba(255,230,242,.6) 52%,rgba(255,255,255,0) 70%)}
.copy{position:absolute;left:84px;top:118px;width:640px}
.copy .wordmark{margin-bottom:22px}
.copy h1{font-size:104px;line-height:1.1;font-weight:400;
  background:linear-gradient(100deg,#d4669a 0%,#9b7fe0 55%,#5a9ee0 100%);-webkit-background-clip:text;color:transparent}
.copy .tag{margin-top:26px;font-family:"WK",serif;font-size:34px;color:#4a3a60;letter-spacing:2px}
.copy .desc{margin-top:16px;font-size:22px;color:#6c5c80;line-height:1.6}
.copy .url{position:absolute;top:396px}
</style></head><body>
${stars(7, 70)}
<div class="ring" style="left:-80px;top:-90px;width:300px;height:300px"></div>
<div class="ring blue" style="left:600px;top:420px;width:180px;height:180px"></div>
<div class="halo"></div>
${bubbles(11, 9, { x: 640, y: 30, w: 520, h: 520 })}
<img class="art" src="${ART_FULL}" alt="">
${bubbles(23, 6, { x: 40, y: 40, w: 600, h: 140 })}
${WAVE}
<div class="copy">
  <div class="wordmark">${SITE.wordmark} · FANTASY</div>
  <h1 class="brand">${esc(SITE.name)}</h1>
  <p class="tag">${esc(SITE.tagline)}</p>
  <p class="desc">${esc(SITE.description)}</p>
  <div class="url">${SITE.url}</div>
</div>
<div class="credit">角色立绘 © Kuro Games</div>
</body></html>`;
}

function kgHtml(post) {
  const dots = Array.from({ length: post.total }, (_, i) => `<i class="${i + 1 === post.index ? "on" : i + 1 < post.index ? "past" : ""}"></i>`).join("");
  /* 标题尽量一行放下（780px 宽），太长时最小 56px 并均衡折成两行 */
  const size = Math.max(56, Math.min(92, Math.floor(780 / [...post.title].length) - 3));
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${BASE_CSS}
.copy{position:absolute;left:80px;top:78px;width:790px}
.head{display:flex;align-items:center;gap:18px}
.site{font-size:26px;color:#6a5584}
.num{position:absolute;right:52px;top:40px;font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;font-weight:700;font-size:150px;line-height:1;
  color:rgba(255,255,255,.55);-webkit-text-stroke:2px rgba(212,140,190,.45);letter-spacing:-4px}
h1{margin-top:44px;font-family:"WK",serif;font-weight:400;font-size:${size}px;line-height:1.18;letter-spacing:3px;color:#2c2140;text-wrap:balance}
.desc{margin-top:26px;font-size:24px;line-height:1.65;color:#5f5175;max-width:740px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dots{position:absolute;left:80px;bottom:74px;display:flex;gap:12px;align-items:center}
.dots i{width:14px;height:14px;border-radius:50%;background:rgba(160,140,200,.25);box-shadow:inset 0 0 0 1px rgba(160,140,200,.35)}
.dots i.past{background:rgba(232,138,178,.45)}
.dots i.on{width:44px;border-radius:999px;background:linear-gradient(90deg,#e88ab2,#79b4ea)}
.foot{position:absolute;left:80px;bottom:30px;display:flex;gap:16px;align-items:baseline}
.foot .brand{font-size:24px;color:#4a3a60}
.face{position:absolute;right:70px;bottom:92px;width:236px;height:236px;border-radius:50%;
  box-shadow:0 0 0 8px rgba(255,255,255,.75),0 0 0 9.5px rgba(232,138,178,.45),0 20px 46px rgba(150,110,170,.35)}
</style></head><body>
${stars(post.index * 31, 46)}
<div class="ring" style="left:860px;top:300px;width:340px;height:340px"></div>
<div class="ring blue" style="left:-60px;top:-70px;width:220px;height:220px"></div>
${bubbles(post.index * 97 + 5, 8, { x: 860, y: 190, w: 300, h: 380 })}
<div class="num">${String(post.index).padStart(2, "0")}</div>
<img class="face" src="${ART_FACE}" alt="">
${WAVE}
<div class="copy">
  <div class="head"><span class="chip">${esc(SERIES.name)} · 第 ${post.index}/${post.total} 篇</span></div>
  <h1>${esc(post.title)}</h1>
  <p class="desc">${esc(post.description)}</p>
</div>
<div class="dots">${dots}</div>
<div class="foot"><span class="brand">${esc(SITE.name)}</span><span class="url">${SITE.url}/blog/${esc(post.slug)}/</span></div>
<div class="credit">角色立绘 © Kuro Games</div>
</body></html>`;
}

// ---------- 截图 ----------
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.error("[og] 需要 Playwright：npm i -D playwright（或在装有它的目录里运行）"); process.exit(1); }

const jobs = [{ name: "home", html: homeHtml() }, ...series.map(p => ({ name: p.slug, html: kgHtml(p) }))].filter(j => !only || j.name === only);
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  await page.setContent(job.html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: "png" });
  let png = await sharp(shot).png({ palette: true, quality: 92, effort: 10, compressionLevel: 9, dither: 0.6 }).toBuffer();
  if (png.length > MAX_BYTES) png = await sharp(shot).png({ palette: true, quality: 80, colours: 160, effort: 10, compressionLevel: 9 }).toBuffer();
  const file = path.join(OUT, `${job.name}.png`);
  fs.writeFileSync(file, png);
  console.log(`[og] ${path.relative(ROOT, file)}  ${(png.length / 1024).toFixed(0)} KB${png.length > MAX_BYTES ? "  ⚠ 超过 300 KB" : ""}`);
}
await browser.close();
