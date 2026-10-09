import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { site } from "@/config/site";

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

/**
 * 给只写了 title / description / canonical 的页面补上 Open Graph：og:url（= canonical，由 metadataBase 补成 https://omiki.cc/…）、
 * 与 <title> 一致的 og:title、og:description，以及首页分享图。
 * 页面里写的 openGraph 会整体替换根布局的那份，所以这里把布局里的默认值（站点名、语言、分享图）一起带上。
 */
export function withPageOg<T extends { title: string; description: string; alternates: { canonical: string } }>(meta: T): T & { openGraph: NonNullable<Metadata["openGraph"]> } {
  return {
    ...meta,
    openGraph: {
      type: "website",
      url: meta.alternates.canonical,
      title: `${meta.title} · ${site.name}`,
      description: meta.description,
      siteName: site.name,
      locale: "zh_CN",
      images: ogImages(HOME_OG_IMAGE, `${site.name} · ${site.description}`),
    },
  };
}
