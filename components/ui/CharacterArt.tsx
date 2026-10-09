import { CHARACTER_ART, CHARACTER_ART_CREDIT, type CharacterArtName } from "@/lib/character-art";

/**
 * 装饰用的官方立绘：服务端组件，纯 <img>（不进客户端 JS）。
 * - 懒加载 + 异步解码，带宽高，srcset 给 600 宽和原图两档，sizes 由调用处按实际显示宽度给；
 * - alt=""，不响应指针；署名小字用系统字体（.no-wenkai），读屏只读到署名。
 * - 位置/尺寸/断点隐藏全部由 variant 对应的 CSS 决定（styles/character-art.css）。
 */
export function CharacterArt({ name, variant, sizes, className }: { name: CharacterArtName; variant: string; sizes: string; className?: string }) {
  const art = CHARACTER_ART[name];
  const base = `/art/characters/${name}`;
  return (
    <figure className={`char-art char-art--${variant}${className ? ` ${className}` : ""}`} data-char-art={name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}.webp`}
        srcSet={`${base}-600.webp 600w, ${base}.webp ${art.w}w`}
        sizes={sizes}
        width={art.w}
        height={art.h}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <figcaption className="char-art__credit no-wenkai">{CHARACTER_ART_CREDIT}</figcaption>
    </figure>
  );
}
