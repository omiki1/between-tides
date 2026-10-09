"use client";
import { usePathname } from "next/navigation";
import { CharacterArt } from "@/components/ui/CharacterArt";

/**
 * 首页专用：爱弥斯（aemeath-03）从页脚上沿、页面右边缘探出来。
 * 这张图底边是硬切的（裁掉了官方标志和 © 小字），只能贴边放，署名必须保留。
 * 放在 <footer> 外层（全宽、position:relative）里，CSS 见 styles/character-art.css。首屏之外，懒加载。
 */
export function FooterArt() {
  const pathname = usePathname() || "/";
  if (pathname !== "/") return null;
  return <CharacterArt name="aemeath-03" variant="footer-peek" sizes="150px" />;
}
