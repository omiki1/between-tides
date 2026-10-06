"use client";
import { usePathname } from "next/navigation";

/** 页脚探头的达妮娅。换图只改这一个常量（例如换成 "/artwork/denia-face-circle@1x.webp"）。 */
export const FOOTER_PEEK_SRC = "/artwork/intro/denia-chibi.webp";

/* 文章详情页（手记 / 项目正文）不显示：那里文末另有达妮娅。 */
const DETAIL_PAGE = /^\/(blog|projects)\/[^/]+\/?$/;

export function FooterPeek() {
  const pathname = usePathname() || "/";
  if (DETAIL_PAGE.test(pathname)) return null;
  return (
    <div className="denia-footer-peek" data-denia-footer="" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FOOTER_PEEK_SRC} alt="" width={60} height={60} loading="lazy" decoding="async" />
    </div>
  );
}
