import { existsSync } from "node:fs";
import path from "node:path";

/**
 * 分享图（1200×630）。图由 scripts/og/render-og.mjs 生成，放在 public/og/：
 *   home.png      首页与全站默认
 *   <slug>.png    知识图谱系列每篇一张（编号与站内「第 N/9 篇」一致）
 * 没有专属图的页面一律回退到 home.png。路径是相对的，由根布局的 metadataBase（https://omiki.cc）补成绝对地址。
 * 只在构建期（服务端）调用。
 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const HOME_OG_IMAGE = "/og/home.png";

const exists = (url: string) => existsSync(path.join(process.cwd(), "public", url));

export function ogImageFor(slug?: string): string {
  if (slug) {
    const own = `/og/${slug}.png`;
    if (exists(own)) return own;
  }
  return HOME_OG_IMAGE;
}

export function ogImages(url: string, alt: string) {
  return [{ url, width: OG_WIDTH, height: OG_HEIGHT, alt, type: "image/png" }];
}
