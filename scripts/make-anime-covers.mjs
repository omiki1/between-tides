#!/usr/bin/env node
/**
 * 追番封面本地化：构建前把 data/bangumi.json 里的 B 站封面下载成站内小尺寸 WebP。
 *   public/anime-covers/{name}.w220.webp（卡片 1x，约 220×293）
 *   public/anime-covers/{name}.w440.webp（卡片 2x）
 * {name} 取 B 站文件名（本身就是内容哈希），所以不需要清单：页面在构建时用 existsSync 判断有没有本地版。
 *
 * 缓存：下载的源图存在 .cache/anime-covers/（不进版本库），已有就不再请求 B 站；输出也是增量生成。
 * 失败兜底：下载失败/超时就跳过，页面会自动退回 B 站的小尺寸参数地址（lib/cover-thumb.ts），不会坏图。
 * ANIME_COVERS=0 可整体跳过（例如离线构建）。
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("public/anime-covers");
const CACHE = path.resolve(".cache/anime-covers");
const SIZES = [[220, 293], [440, 586]];
const CONCURRENCY = 6, TIMEOUT = 10000;

if (process.env.ANIME_COVERS === "0") { console.log("[anime-covers] ANIME_COVERS=0，跳过"); process.exit(0); }
const data = JSON.parse(await fs.readFile("data/bangumi.json", "utf8"));
await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(CACHE, { recursive: true });

export const coverName = (url) => path.basename(new URL(url).pathname).replace(/\.\w+$/, "");
const urls = [...new Set(data.items.map((i) => i.cover).filter((u) => /^https?:\/\/[^/]*hdslb\.com\//.test(u)))];
let made = 0, fetched = 0, failed = 0;

async function one(url) {
  const name = coverName(url);
  const outs = SIZES.map(([w]) => path.join(OUT, `${name}.w${w}.webp`));
  if (outs.every((f) => existsSync(f))) return;
  const src = path.join(CACHE, `${name}.webp`);
  if (!existsSync(src)) {
    // 只拉 2x 尺寸的 B 站缩略图（约 30 KB），不下原图（0.5–2 MB）
    const ctrl = AbortSignal.timeout(TIMEOUT);
    try {
      const res = await fetch(`${url}@440w_586h_1c.webp`, { signal: ctrl, headers: { "User-Agent": "Mozilla/5.0 (between-tides build)" } });
      if (!res.ok) throw new Error(String(res.status));
      await fs.writeFile(src, Buffer.from(await res.arrayBuffer()));
      fetched++;
    } catch (e) { failed++; console.log(`[anime-covers] 下载失败，退回 B 站地址：${name}（${e.message}）`); return; }
  }
  for (const [w, h] of SIZES) {
    const out = path.join(OUT, `${name}.w${w}.webp`);
    if (existsSync(out)) continue;
    await sharp(src).resize(w, h, { fit: "cover" }).webp({ quality: w > 300 ? 68 : 74, effort: 5 }).toFile(out);
    made++;
  }
}
const queue = [...urls];
await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (queue.length) await one(queue.shift()); }));
console.log(`[anime-covers] ${urls.length} 张封面：新下载 ${fetched}，新生成 ${made} 个文件，失败 ${failed}`);
