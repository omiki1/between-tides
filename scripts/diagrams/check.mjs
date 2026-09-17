/**
 * 概念图版面自检。
 *
 * 背景：图解是在构建期用 SVG 拼出来的，无法逐张肉眼确认。
 * 本脚本用一种可自动执行的方式替代目测，检查三类问题：
 *
 *   1. 元素越界 —— 图元或文字超出画布，最常见的结果是文字被裁掉
 *   2. 文字横向溢出 —— 估算宽度超出画布，从而被左右裁切
 *   3. 纵向余量 —— 内容底部与画布底部的距离，过小会挤，过大则画面发空
 *
 * 坐标基准来自 kit.mjs 写入 <metadata> 的几何值（bodyTop / bodyBottom / total）。
 * 图元自身的坐标是组内坐标，因此统一按 bodyTop 平移后再与画布比较 ——
 * 早先的版本靠扫描 <g> 标签位置来推算平移量，容易出错且难以排查。
 *
 * 用法：node scripts/diagrams/check.mjs
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** 与 kit.mjs 的 wrap 用同一套宽度估算，保证结论一致。 */
function units(value) {
  let total = 0;
  for (const char of String(value)) {
    total += /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char) ? 1 : 0.55;
  }
  return total;
}

function parse(svg) {
  const meta = JSON.parse(/<metadata>([^<]+)<\/metadata>/.exec(svg)[1]);
  const { bodyTop, bodyBottom, total: canvasHeight, width } = meta;

  // 坐标换算：正文组从 bodyTop 开始，正文区高度 = bodyBottom - bodyTop。
  // 因此组内 y 落在 [0, bodyBottom - bodyTop] 的属于正文，绝对 y = bodyTop + y；
  // 而页眉与图注的 y 是按画布坐标写的，不需要再加偏移。
  const bodyInnerBottom = bodyBottom - bodyTop;
  const texts = [...svg.matchAll(/<text x="(\d+(?:\.\d+)?)" y="(\d+(?:\.\d+)?)"[^>]*font-size="(\d+(?:\.\d+)?)"[^>]*text-anchor="(\w+)"[^>]*>([^<]*)<\/text>/g)].map((m) => {
    const rawY = Number(m[2]);
    const inBody = rawY <= bodyInnerBottom;
    return {
      x: Number(m[1]),
      rawY,
      y: inBody ? rawY + bodyTop : rawY,
      size: Number(m[3]),
      anchor: m[4],
      value: m[5],
      w: units(m[5]) * Number(m[3]) * 0.62,
      inBody,
    };
  });

  return { meta, canvasHeight, width, bodyTop, bodyBottom, bodyInnerBottom, texts };
}

const files = (await readdir(here)).filter((f) => /^\d\d-.*\.mjs$/.test(f)).sort();
const problems = [];
let checked = 0;

for (const file of files) {
  const mod = await import(new URL(`./${file}`, import.meta.url));
  for (const [exportName, diagrams] of Object.entries(mod).filter(([, v]) => Array.isArray(v))) {
    for (const { slug, svg } of diagrams) {
      checked += 1;
      const { meta, canvasHeight, width, bodyTop, bodyBottom, bodyInnerBottom, texts } = parse(svg);
      const at = (msg) => problems.push(`${slug}: ${msg}`);

      // 1. 文字纵向：正文与图注都必须在画布内
      for (const t of texts) {
        if (t.y < 6 || t.y > canvasHeight - 6) {
          at(`文字纵向越界 y=${t.y.toFixed(0)} 画布高=${canvasHeight}：「${t.value.slice(0, 30)}」`);
        }
      }

      // 2. 文字横向：估算宽度不得超出画布
      for (const t of texts) {
        const left = t.anchor === "middle" ? t.x - t.w / 2 : t.anchor === "end" ? t.x - t.w : t.x;
        const right = left + t.w;
        if (left < 4 || right > width - 4) {
          at(`文字横向溢出 left=${left.toFixed(0)} right=${right.toFixed(0)} 画布宽=${width}：「${t.value.slice(0, 30)}」`);
        }
      }

      // 3. 明确要求正文高度必须覆盖到内容底部（bodyBottom 是调用方声明的）
      if (bodyBottom <= 0 || canvasHeight - bodyBottom < 34) {
        at(`正文底部与画布底部余量不足：bodyBottom=${bodyBottom} canvas=${canvasHeight}`);
      }

      // 4. 图注基线应落在图注区内，而不是压在正文上或超出画布
      const caption = texts.find((t) => !t.inBody && t.rawY > bodyInnerBottom);
      if (meta.caption && caption) {
        const margin = canvasHeight - caption.y;
        if (margin < 6) at(`图注过贴底边：余量 ${margin.toFixed(0)}px`);
        if (margin > 46) at(`图注离底边过远：余量 ${margin.toFixed(0)}px（图注区偏高，画面会显得空）`);
      }
    }
  }
}

console.log(`检查 ${checked} 张概念图。`);
if (problems.length) {
  for (const message of problems) console.log(`  ! ${message}`);
  console.log(`\n${problems.length} 个问题需要处理。`);
  process.exit(1);
}
console.log("版面检查通过：无越界、无横向溢出，纵向余量在图注区内。");
