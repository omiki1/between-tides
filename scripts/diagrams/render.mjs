/**
 * 把 scripts/diagrams/*.mjs 里定义的概念图渲染为 WebP，输出到 public/posts/kg/。
 *
 * 用法：
 *   node scripts/diagrams/render.mjs           全部渲染
 *   node scripts/diagrams/render.mjs 00 01     只渲染指定前缀的文章
 *
 * 概念图是构建期的静态资源（和 Markdown 一样属于内容），因此预渲染到 public/
 * 而不是在请求时生成：产物可缓存、可进版本库之外的构建流程，也不影响构建时长。
 */
import { readdir } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(process.cwd(), "public", "posts", "kg");
mkdirSync(outDir, { recursive: true });

const filters = process.argv.slice(2);

const modules = (await readdir(here))
  .filter((file) => /^\d\d-.*\.mjs$/.test(file))
  .sort();

let count = 0;
let failures = 0;

for (const file of modules) {
  if (filters.length && !filters.some((f) => file.startsWith(f))) continue;

  const mod = await import(new URL(`./${file}`, import.meta.url));
  const groups = Object.entries(mod).filter(([, value]) => Array.isArray(value));

  for (const [exportName, diagrams] of groups) {
    for (const { slug, svg } of diagrams) {
      const target = path.join(outDir, `${slug}.webp`);
      try {
        const info = await sharp(Buffer.from(svg), { density: 144 })
          .resize({ width: 1600, withoutEnlargement: false })
          .webp({ quality: 88, effort: 5 })
          .toFile(target);
        const meta = await sharp(target).metadata();
        console.log(
          `ok   ${file.padEnd(20)} ${exportName.padEnd(12)} ${slug.padEnd(24)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(5)} ${(info.size / 1024).toFixed(0)} KB`,
        );
        count += 1;
      } catch (error) {
        console.error(`FAIL ${slug}: ${error instanceof Error ? error.message : String(error)}`);
        failures += 1;
      }
    }
  }
}

console.log(`\n渲染 ${count} 张概念图${failures ? `，失败 ${failures} 张` : ""}。输出目录 public/posts/kg/`);
process.exit(failures ? 1 : 0);
