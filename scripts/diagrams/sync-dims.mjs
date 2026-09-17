/**
 * 把文章里插图的尺寸标注同步为图片的实际尺寸。
 *
 * 为什么需要这个脚本
 * ------------------
 * 概念图由脚本生成，高度取决于内容，写文章时无法估准（实测偏差可达 300px 以上）。
 * 而且每次重新渲染，产物尺寸都可能变化，此前写下的标注随之失效。
 * 手工维护一组 19 个数字既繁琐又必然出错 —— 开发过程中实际发生过两轮共 14 处失效。
 *
 * 因此把这一步做成命令：渲染图解后运行它，标注会被就地改写为真实值。
 *
 *   npm run diagrams         生成并渲染图解
 *   npm run diagrams:sync    按产物实际尺寸回写文章里的标注
 *   npm run images:check     校验（CI / 提交前用，防止忘记上面那一步）
 *
 * 用法：
 *   node scripts/diagrams/sync-dims.mjs            同步全部文章
 *   node scripts/diagrams/sync-dims.mjs --dry-run  只报告差异，不写文件
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dryRun = process.argv.includes("--dry-run");
const postsDir = path.join(process.cwd(), "content", "posts");

/** 只处理引用了图解产物的图片引用；其他插图（手记封面、装饰图）同样一并同步。 */
const REFERENCE = /!\[([^\]]*)\]\((\/[^)\s"]+)(?:\s+"([^"]*)")?\)/g;

let changed = 0;
let matched = 0;
let skipped = 0;

for (const file of readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort()) {
  const target = path.join(postsDir, file);
  const original = readFileSync(target, "utf8");
  let updated = original;

  for (const match of [...original.matchAll(REFERENCE)]) {
    const [whole, alt, src, declared] = match;
    const imagePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));

    let meta;
    try {
      meta = await sharp(imagePath).metadata();
    } catch {
      // 外链图片或尚未渲染的产物，跳过而不报错：这不是本脚本的职责
      skipped += 1;
      continue;
    }

    const actual = `${meta.width}x${meta.height}`;
    if (declared === actual) {
      matched += 1;
      continue;
    }

    updated = updated.replace(whole, `![${alt}](${src} "${actual}")`);
    changed += 1;
    console.log(
      `  ${file.padEnd(42)} ${path.basename(src).padEnd(34)} ${(declared ?? "未声明").padEnd(11)} -> ${actual}`,
    );
  }

  if (updated !== original && !dryRun) writeFileSync(target, updated, "utf8");
}

console.log(
  `\n${dryRun ? "[dry-run] " : ""}更新 ${changed} 处，已一致 ${matched} 处，跳过 ${skipped} 处（外链或未渲染）。`,
);
if (dryRun && changed) {
  console.log("去掉 --dry-run 即可写入。");
}
