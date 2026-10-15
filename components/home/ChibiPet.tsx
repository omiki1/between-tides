"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { afterLoadIdle } from "@/lib/after-load";

/*
 * 首页右栏的 Q 版小人（CSS 雪碧图 steps 动画）。
 * - 服务端只输出固定尺寸的空盒子 + 署名（CLS 0）；window load 之后才挑一个角色、加载那一张雪碧图。
 * - 只在视口内播放；标签页隐藏、系统「减少动态」或站内氛围设为 reduce 时只显示第一帧（见 styles/chibi.css）。
 * - 点击换下一位（只在点击时才去取下一张图）。
 */
const PETS = [
  ["denia", "达妮娅"], ["aemeath", "爱弥斯"], ["iuno", "尤诺"], ["lupa", "露帕"],
  ["jinhsi", "今汐"], ["phrolova", "弗洛洛"], ["phoebe", "菲比"],
] as const;

export function ChibiPet() {
  const box = useRef<HTMLButtonElement>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const [play, setPlay] = useState(false);
  const ready = idx !== null;

  useEffect(() => afterLoadIdle(() => setIdx(Math.floor(Math.random() * PETS.length))), []);

  useEffect(() => {
    const el = box.current;
    if (!el || !ready || !("IntersectionObserver" in window)) return;
    let visible = false;
    const sync = () => setPlay(visible && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; sync(); }, { rootMargin: "40px" });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [ready]);

  const next = useCallback(() => {
    setIdx((cur) => {
      const n = ((cur ?? 0) + 1) % PETS.length;
      new Image().src = `/art/chibi/${PETS[n][0]}.webp`;
      return n;
    });
  }, []);

  const pet = idx === null ? null : PETS[idx];
  return (
    <figure className="chibi-pet" data-pagefind-ignore="all">
      <button
        ref={box}
        type="button"
        className={`chibi-pet__box${play ? " is-play" : ""}`}
        onClick={next}
        aria-label={pet ? `Q 版${pet[1]}，点一下换个小伙伴` : "Q 版小人"}
        style={pet ? ({ "--chibi": `url(/art/chibi/${pet[0]}.webp)` } as React.CSSProperties) : undefined}
        data-ready={pet ? "" : undefined}
      />
      <figcaption className="chibi-pet__credit no-wenkai">Q 版插画 · 非官方 · 角色 © Kuro Games</figcaption>
    </figure>
  );
}