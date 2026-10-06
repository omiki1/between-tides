#!/usr/bin/env node
/**
 * 为常用大图生成多种宽度的 WebP（文件名 name.w{宽}.webp，与原图同目录），
 * 并写出 lib/image-variants.json 供 next/image 的自定义 loader（lib/image-loader.ts）选用。
 *
 * 只做缩小，不放大；原图保留，作为最大一档。
 * 由 predev / prebuild / pretypecheck 自动运行：变体与清单都是构建产物（已在 .gitignore），
 * 所以清单永远只列出「这台机器上真的存在」的文件 —— public/assets/ 不进版本库，
 * 缺图时这里会跳过，loader 也就退回原图，不会出现 404。已存在且比原图新的变体不重复生成。
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync, statSync } from "node:fs";

const PUBLIC = path.resolve("public");
// 宽度尽量取 next/image 默认 deviceSizes / imageSizes 里的值（384、640、750、828、1080…），
// 这样 srcset 里的 w 描述符就是文件的真实宽度，浏览器不会因为描述符偏小而多拿一档。
const GROUPS = [
  { files: ["artwork/denia.webp"], widths: [384, 640, 750] },
  { files: ["artwork/dream-tide.webp"], widths: [640, 828, 1080] },
  { files: ["avatar.jpg"], widths: [96, 128, 256, 384] },
  // public/assets/ 不在版本库里（.gitignore 的 assets/ 规则），部署机上有就生成，没有就跳过
  { dir: "assets/denia/hero", widths: [384, 640, 828, 1080] },
  { dir: "posts", widths: [640, 828, 1080] },
  { dir: "gallery/kg", widths: [640, 828, 1080] },
];
const manifest = {};
let made = 0;
for (const group of GROUPS) {
  if (group.dir && !existsSync(path.join(PUBLIC, group.dir))) { console.log(`[image-variants] 跳过（目录不存在）：/${group.dir}/`); continue; }
  const files = group.files ?? (await fs.readdir(path.join(PUBLIC, group.dir)))
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f) && !/\.w\d+\.webp$/.test(f)).map((f) => `${group.dir}/${f}`);
  for (const rel of files) {
    const src = path.join(PUBLIC, rel);
    if (!existsSync(src)) { console.log(`[image-variants] 跳过（文件不存在）：/${rel}`); continue; }
    const { width } = await sharp(src).metadata();
    const srcTime = statSync(src).mtimeMs;
    const done = [];
    for (const w of group.widths.filter((w) => w < width)) {
      const out = src.replace(/\.(\w+)$/, `.w${w}.webp`);
      if (!existsSync(out) || statSync(out).mtimeMs < srcTime) {
        await sharp(src).resize({ width: w }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(out);
        made++;
      }
      done.push(w);
    }
    if (done.length) manifest[`/${rel}`] = done;
    // 清掉旧宽度留下的文件，避免 public/ 里堆积用不到的变体
    const base = path.basename(src).replace(/\.\w+$/, "");
    for (const f of await fs.readdir(path.dirname(src))) {
      const m = f.match(/^(.*)\.w(\d+)\.webp$/);
      if (m && m[1] === base && !done.includes(Number(m[2]))) await fs.rm(path.join(path.dirname(src), f));
    }
  }
}
await fs.writeFile("lib/image-variants.json", JSON.stringify(manifest, null, 1) + "\n");
console.log(`[image-variants] ${Object.keys(manifest).length} 张图有缩小版，本次新生成 ${made} 个文件`);
