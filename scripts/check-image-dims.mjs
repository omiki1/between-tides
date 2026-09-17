/**
 * 校验文章里插图的尺寸标注。
 *
 * lib/markdown.ts 会从 Markdown 图片标题里读取尺寸（`![alt](/path "1600x900")`），
 * 宽高比小于 1 时给 figure 加 is-tall 类，由 CSS 在桌面端限宽居中。
 * 因此标题里的数字必须与图片真实尺寸一致：写错了会直接导致竖幅图被当成横幅处理，
 * 表现为图片被拉得过高。
 *
 * 为什么必须自动校验
 * ------------------
 * 概念图的高度由内容决定，无法在写文章时估准 —— 实测偏差曾达到 313px。
 * 而只要重新渲染一次图解，产物尺寸就可能变化，此前写下的标注随即失效。
 * 这个脚本在 2026-09-17 的实际开发中抓到了两轮共 14 处失效标注，
 * 每一轮都发生在「先渲染、后忘记回写」之后。
 *
 * 正确流程是：`npm run diagrams` 渲染 → `npm run diagrams:sync` 回写标注 → 提交。
 * 本脚本作为最后一道防线，让「忘记回写」变成一个构建期就能发现的错误。
 *
 * 用法：node scripts/check-image-dims.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const postsDir = path.join(process.cwd(), "content", "posts");
const problems = [];
let checked = 0;

/**
 * 顺带校验 content/posts 目录的构成。
 *
 * 这个目录只应包含 .md 文件：Next 的文章路由按 .md 前缀匹配，
 * 混入的其他文件不会被当成文章，也不会报错，只会悄悄躺在版本库里。
 * 实际开发中曾因一次批量编辑脚本传错路径而写入一个 0 字节的 .mjs 文件。
 */
function checkPostsDirectory() {
  const stray = readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.endsWith(".md"))
    .map((entry) => entry.name);

  if (stray.length) {
    problems.push(`content/posts 下存在非 .md 文件：${stray.join(", ")}`);
  }

  const empty = readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .filter((entry) => readFileSync(path.join(postsDir, entry.name), "utf8").trim() === "")
    .map((entry) => entry.name);

  if (empty.length) {
    problems.push(`content/posts 下存在空文件：${empty.join(", ")}`);
  }
}

checkPostsDirectory();

for (const file of readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort()) {
  const source = readFileSync(path.join(postsDir, file), "utf8");

  // 只检查站内图片；外链图片无法在此校验
  for (const match of source.matchAll(/!\[[^\]]*\]\((\/[^)\s"]+)(?:\s+"([^"]*)")?\)/g)) {
    const [, src, declared] = match;
    const target = path.join(process.cwd(), "public", src.replace(/^\//, ""));

    let meta;
    try {
      meta = await sharp(target).metadata();
    } catch {
      problems.push(`${file}: 图片不存在 ${src}`);
      continue;
    }

    checked += 1;
    const actual = `${meta.width}x${meta.height}`;
    if (!declared) {
      problems.push(`${file}: ${src} 未声明尺寸，竖幅图会被当成横幅处理`);
      continue;
    }
    if (declared !== actual) {
      problems.push(`${file}: ${src} 声明 ${declared} 与实际 ${actual} 不符`);
      continue;
    }

    // 宽高比接近 1 时，是否标成 is-tall 影响不大，不做强制要求
    const ratio = meta.width / meta.height;
    if (ratio < 1) {
      console.log(`ok   ${file.padEnd(38)} ${src.padEnd(44)} ${actual}  竖幅，将限宽居中`);
    }
  }
}

console.log(`\n检查 ${checked} 张插图。`);
if (problems.length) {
  for (const message of problems) console.log(`  ! ${message}`);
  console.log(`${problems.length} 个问题需要处理。`);
  process.exit(1);
}
console.log("尺寸标注全部与图片实际尺寸一致。");
