import type { CSSProperties } from "react";
import { ZZZ_BANNER, ZZZ_CREDIT, type ZzzName } from "@/lib/zzz-art";

/**
 * 关于页「游戏角落」顶部：柏妮思 + 克拉蕾黑白半身横幅，两张图在中间互相渐隐叠在一起。
 * 两张图的底边是原图硬切，贴住横幅下沿；左边缘用遮罩渐隐。纯装饰，无投影、无底板。CSS 见 styles/zzz.css。
 */
function Art({ name }: { name: ZzzName }) {
  const a = ZZZ_BANNER[name];
  const base = `/art/zzz/${name}-banner`;
  return (
    <span className={`zzz-banner__art zzz-banner__art--${name} zzz-glint`} style={{ "--zzz-mask": `url(${base}-600w.webp)` } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${base}.webp`}
        srcSet={`${base}-600w.webp 600w, ${base}.webp ${a.w}w`}
        sizes="(max-width: 700px) 60vw, (max-width: 1240px) 52vw, 680px"
        width={a.w}
        height={a.h}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </span>
  );
}

export function ZzzBanner() {
  return (
    <figure className="zzz-banner" data-zzz-banner="">
      <Art name="burnice" />
      <Art name="claret" />
      <figcaption className="zzz-credit no-wenkai">{ZZZ_CREDIT}</figcaption>
    </figure>
  );
}
