"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { ZZZ_CREDIT, ZZZ_FULL, type ZzzName } from "@/lib/zzz-art";

const WIDE = "(min-width: 1201px)";

/**
 * 首页左右两栏底部（首屏之外）的绝区零全身立绘，只在夜间模式、≥1201px 时出现：柏妮思在左、克拉蕾在右。
 * 服务端只输出按原图比例固定的空容器（日间 / 窄屏由 CSS 隐藏）；挂载后确认是夜间 + 宽屏才插入 <img>，
 * 所以日间什么都不下载，也没有水合不一致和布局偏移。切到夜间时再插入。CSS 见 styles/zzz.css。
 */
export function NightFullBody({ name }: { name: ZzzName }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const wide = window.matchMedia(WIDE);
    let live = true;
    let done = false;
    const update = () => {
      if (done || !root.classList.contains("dark") || !wide.matches) return;
      done = true;
      queueMicrotask(() => { if (live) setShow(true); });
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    wide.addEventListener("change", update);
    return () => { live = false; mo.disconnect(); wide.removeEventListener("change", update); };
  }, []);
  const art = ZZZ_FULL[name];
  const base = `/art/zzz/${name}-full`;
  return (
    <figure className="zzz-night" data-zzz-full={name}>
      <div className={`zzz-night__box zzz-night__box--${name}`}>
        {show && (
          <span className="zzz-glint" style={{ "--zzz-mask": `url(${base}-600w.webp)` } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}.webp`}
              srcSet={`${base}-600w.webp 600w, ${base}.webp ${art.w}w`}
              sizes="230px"
              width={art.w}
              height={art.h}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </span>
        )}
      </div>
      <figcaption className="zzz-credit no-wenkai" aria-hidden={show ? undefined : true}>{ZZZ_CREDIT}</figcaption>
    </figure>
  );
}
