/**
 * next/image 的自定义 loader（静态导出没有图片优化服务）。
 *
 * scripts/make-image-variants.mjs 在构建前为常用大图生成 name.w{宽}.webp，
 * 并写出 lib/image-variants.json。这里按 next/image 请求的宽度挑「不小于它的最小变体」，
 * 没有合适的变体就返回原图 —— 于是 srcset 里小屏拿到小图，大屏仍是原图，
 * 而不在清单里的图片（外链、未登记的目录）行为与 unoptimized 完全一样。
 */
import variants from "./image-variants.json";

const table = variants as Record<string, number[]>;

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const widths = table[src];
  if (!widths) return src;
  const pick = widths.find((w) => w >= width);
  return pick ? src.replace(/\.\w+$/, `.w${pick}.webp`) : src;
}
