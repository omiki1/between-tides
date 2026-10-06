#!/usr/bin/env node
/**
 * 静态导出的 RSC 分段文件路径检查（next build 之后运行）。
 *
 * 线上每页都有 404：浏览器预取 /blog/__next.blog.__PAGE__.txt，服务器上却只有 /blog/__next.blog/__PAGE__.txt。
 * 原因是 Next 16.0–16.1 的静态导出把分段文件写成嵌套目录，客户端却按「点分隔的文件名」请求
 * （vercel/next.js#85374，16.2 修复）。package-lock 锁的是 16.3.5，产物本来就是点分隔的；
 * 线上那份是用旧版本 node_modules 构建出来的。
 *
 * 本脚本做两件事：
 *   1. node_modules 里的 next 低于 16.2 时给出警告（部署前先 npm ci）
 *   2. 兜底：发现嵌套的 __next.xxx/ 目录就复制成点分隔的文件名，两种路径都能访问
 */
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] || "out");
try {
  const { version } = JSON.parse(readFileSync(path.resolve("node_modules/next/package.json"), "utf8"));
  const [major, minor] = version.split(".").map(Number);
  if (major === 16 && minor < 2) console.warn(`[rsc] 警告：当前 next ${version} 的静态导出会产生预取 404，请先运行 npm ci（package-lock 锁定 16.3.5）`);
} catch { /* 没有 node_modules/next 时跳过版本检查 */ }

let fixed = 0;
async function filesUnder(dir, prefix = []) {
  const list = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) list.push(...await filesUnder(p, [...prefix, entry.name]));
    else list.push({ p, parts: [...prefix, entry.name] });
  }
  return list;
}
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "_next" || entry.name === "pagefind") continue;
    const p = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const { p: file, parts } of await filesUnder(p)) {
        const flat = path.join(dir, [entry.name, ...parts].join("."));
        try { await fs.access(flat); } catch { await fs.copyFile(file, flat); fixed++; }
      }
    } else await walk(p);
  }
}
await walk(OUT);
console.log(fixed ? `[rsc] 补齐了 ${fixed} 个点分隔的 RSC 分段文件` : "[rsc] RSC 分段文件路径正常（点分隔），无需处理");
