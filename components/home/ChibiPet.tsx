"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { afterLoadIdle } from "@/lib/after-load";
import { CHIBI_GLOWS } from "@/lib/chibi-glows";
import "@/styles/chibi.css";

/*
 * 首页「友链」下方的一排 Q 版小人（3 个，CSS 雪碧图 steps 动画）。
 * - 服务端只输出固定尺寸的空盒子 + 署名 + 刷新按钮（CLS 0）。
 * - window load 之后，并且这一排接近视口（IntersectionObserver，提前 400px）才随机挑 3 位、去取 3 张雪碧图。
 * - 只在视口内、标签页可见时播放；减少动态时只显示第一帧（见 styles/chibi.css）；三个的相位错开。
 * - 右侧圆形按钮「随机换一组」：重新挑 3 位（尽量和当前不同），只在点击时才取新的图。
 */
const PETS = [
  ["denia", "达妮娅"], ["aemeath", "爱弥斯"], ["iuno", "尤诺"], ["lupa", "露帕"],
  ["jinhsi", "今汐"], ["phrolova", "弗洛洛"], ["phoebe", "菲比"],
] as const;

function pick3(prev: number[] | null): number[] {
  for (let tries = 0; tries < 20; tries++) {
    const pool = PETS.map((_, i) => i);
    const out: number[] = [];
    while (out.length < 3) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]!);
    if (!prev || out.some((n) => !prev.includes(n))) return out;
  }
  return PETS.map((_, i) => i).slice(0, 3);
}

export function ChibiPet({ variant = "band" }: { variant?: "band" | "hero" }) {
  const root = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [picks, setPicks] = useState<number[] | null>(null);
  const [play, setPlay] = useState(false);
  const [spin, setSpin] = useState(0);

  /* load 之后 + 接近视口 → 才开始挑人、取图 */
  useEffect(() => {
    let loaded = false, near = false, done = false;
    const go = () => { if (!done && loaded && near) { done = true; setArmed(true); } };
    const cancel = afterLoadIdle(() => { loaded = true; go(); });
    const el = root.current;
    const io = el && "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = !!e?.isIntersecting; go(); }, { rootMargin: "400px" })
      : null;
    if (io && el) io.observe(el); else { near = true; go(); }
    return () => { cancel(); io?.disconnect(); };
  }, []);
  useEffect(() => { if (armed) setPicks((cur) => cur ?? pick3(null)); }, [armed]);

  /* 只在视口内、标签页可见时播放 */
  useEffect(() => {
    const el = root.current;
    if (!el || !picks || !("IntersectionObserver" in window)) return;
    let visible = false;
    const sync = () => setPlay(visible && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; sync(); }, { rootMargin: "40px" });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, [picks !== null]);

  const reroll = useCallback(() => {
    setSpin((n) => n + 1);
    setPicks((cur) => {
      const next = pick3(cur);
      for (const n of next) new Image().src = `/art/chibi/${PETS[n]![0]}.webp`;
      return next;
    });
  }, []);

  return (
    <div className={`chibi-band${variant === "hero" ? " chibi-band--hero" : ""}`} ref={root} data-pagefind-ignore="all">
      <div className="chibi-row">
        {[0, 1, 2].map((slot) => {
          const pet = picks ? PETS[picks[slot]!]! : null;
          return (
            <div
              key={slot}
              className={`chibi-slot${play ? " is-play" : ""}`}
              style={{ "--phase": `${-slot * 0.83}s`, "--glow-phase": `${-slot * 1.9}s` } as React.CSSProperties}
            >
              <div
                className="chibi-pet__box"
                role="img"
                aria-label={pet ? `Q 版${pet[1]}` : undefined}
                aria-hidden={pet ? undefined : true}
                style={pet ? ({ "--chibi": `url(/art/chibi/${pet[0]}.webp)` } as React.CSSProperties) : undefined}
                data-ready={pet ? "" : undefined}
              />
              {pet && (CHIBI_GLOWS[pet[0]]?.length ?? 0) > 0 && (<span className="chibi-glows" aria-hidden="true">{CHIBI_GLOWS[pet[0]]!.map((g, i) => (<i key={i} className={`chibi-glow chibi-glow--${g.kind}`} style={{ left: `${g.x}%`, top: `${g.y}%`, width: `${g.size}%`, animationDelay: `${-(slot * 1.7 + i * 1.1)}s` }} />))}</span>)}
            </div>
          );
        })}
        <button type="button" className="chibi-refresh" onClick={reroll} aria-label="随机换一组" title="随机换一组">
          <RotateCw size={16} aria-hidden="true" style={{ transform: `rotate(${spin * 360}deg)` }} />
        </button>
      </div>
      <p className="chibi-pet__credit no-wenkai">Q 版插画 · 非官方 · 角色 © Kuro Games</p>
    </div>
  );
}