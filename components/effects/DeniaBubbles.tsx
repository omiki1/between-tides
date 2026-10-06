"use client";
import { useEffect, useRef } from "react";

/* 泡影视阈：全站唯一的泡泡系统。
 * - 点按钮/卡片：1–2 个虹彩小泡泡；点空白处（仅精细指针）：2–3 个更小的泡泡。
 * - window.deniaBubble(x, y, opts?) 供其他组件复用（例如复制代码后冒一个「复制好啦」）。
 * 纯 DOM + WAAPI，同屏限量；减弱动效时普通泡泡全部关闭，带文字的反馈泡泡退化为原地淡入淡出。 */

export type DeniaBubbleOptions = {
  /** 带文字的反馈泡泡，例如「复制好啦」；建议 ≤ 8 个字 */
  text?: string;
  /** 普通泡泡个数，默认 1，最多 4（有 text 时忽略） */
  count?: number;
  /** 普通泡泡直径（px），默认 9–19 随机 */
  size?: number;
  /** 更小、更短的泡泡（空白处点击用的那种） */
  tiny?: boolean;
};

declare global {
  interface Window {
    deniaBubble?: (x: number, y: number, opts?: DeniaBubbleOptions) => void;
  }
}

const TARGET = [
  ".button-primary", ".button-quiet", ".guestbook-write", "[data-denia-bubble]",
  ".widget-card", ".aside-card", ".project-card", ".album-card", ".friend-card",
  ".steam-card", ".post-table a", ".featured-post", ".taxonomy-card",
].join(",");
/* 游戏区、表单控件、可编辑区域：一律不冒泡 */
const SKIP = ".sakura-pick,.reaction-test,.beat-tap,.live-wallpaper,input,textarea,select,option,[contenteditable]:not([contenteditable=false]),dialog,.music-dock,.pointer-effects";
/* 空白处判定：不在任何可交互元素里（链接/按钮各自已有反馈） */
const INTERACTIVE = "a,button,label,summary,[role=button],[role=link],[role=tab],[tabindex]:not([tabindex='-1']),video,audio,iframe,canvas";
const MAX_ALIVE = 12;

export function DeniaBubbles() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const host = layer.current;
    if (!host) return;
    let alive = 0;
    const quiet = () => reduce.matches || document.documentElement.dataset.ambianceMotion === "reduce";

    const track = (el: HTMLElement, animation: Animation) => {
      alive++;
      const done = () => { el.remove(); alive = Math.max(0, alive - 1); };
      animation.onfinish = done;
      animation.oncancel = done;
    };

    const bubble = (x: number, y: number, index: number, opts: DeniaBubbleOptions) => {
      if (alive >= MAX_ALIVE) return;
      const el = document.createElement("i");
      const size = opts.size ?? (opts.tiny ? 5 + Math.random() * 5 : 9 + Math.random() * 10);
      el.className = "denia-bubble";
      el.style.width = el.style.height = `${size}px`;
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${y - size / 2}px`;
      host.appendChild(el);
      const spread = opts.tiny ? 26 : 34;
      const dx = (Math.random() - 0.5) * spread + (index % 2 ? 12 : -6);
      const rise = opts.tiny ? 34 + Math.random() * 30 : 64 + Math.random() * 46;
      const animation = el.animate(
        [
          { transform: "translate(0,0) scale(.3)", opacity: 0 },
          { transform: `translate(${dx * 0.2}px,-8px) scale(1)`, opacity: 1, offset: 0.14 },
          { transform: `translate(${dx}px,${-rise}px) scale(1)`, opacity: 0.9, offset: 0.86 },
          { transform: `translate(${dx}px,${-rise - 5}px) scale(1.55)`, opacity: 0 },
        ],
        {
          duration: (opts.tiny ? 1000 : 1500) + Math.random() * 450,
          delay: index * (opts.tiny ? 70 : 110),
          easing: "cubic-bezier(.33,0,.3,1)",
          fill: "both",
        },
      );
      track(el, animation);
    };

    const label = (x: number, y: number, text: string) => {
      /* 文字反馈是功能性的：不受同屏上限限制，但同一时刻只保留最新的 3 个 */
      const labels = host.querySelectorAll(".denia-bubble-text");
      if (labels.length >= 3) labels[0].remove();
      const el = document.createElement("span");
      el.className = "denia-bubble-text";
      el.textContent = text.slice(0, 16);
      const vw = document.documentElement.clientWidth;
      el.style.left = `${Math.min(vw - 12, Math.max(12, x))}px`;
      el.style.top = `${Math.max(36, y)}px`;
      host.appendChild(el);
      const still = quiet();
      const animation = el.animate(
        still
          ? [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
          : [
              { transform: "translate(-50%,-60%) scale(.6)", opacity: 0 },
              { transform: "translate(-50%,-125%) scale(1)", opacity: 1, offset: 0.18 },
              { transform: "translate(-50%,-150%) scale(1)", opacity: 1, offset: 0.78 },
              { transform: "translate(-50%,-170%) scale(1.12)", opacity: 0 },
            ],
        { duration: still ? 1400 : 1600, easing: "cubic-bezier(.22,.8,.3,1)", fill: "both" },
      );
      animation.onfinish = () => el.remove();
      animation.oncancel = () => el.remove();
      if (!still) bubble(x + 10, y - 6, 0, { tiny: true });
    };

    const api = (x: number, y: number, opts: DeniaBubbleOptions = {}) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (opts.text) { label(x, y, opts.text); return; }
      if (quiet()) return;
      const count = Math.min(4, Math.max(1, Math.round(opts.count ?? 1)));
      for (let i = 0; i < count; i++) bubble(x, y, i, opts);
    };
    window.deniaBubble = api;

    /* click（而不是 pointerdown）：触屏滚动时不会误触发；键盘触发的 click（detail===0）没有坐标，跳过 */
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.detail === 0 || quiet()) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(SKIP)) return;
      if (target.closest(TARGET)) {
        api(event.clientX, event.clientY, { count: fine.matches && Math.random() < 0.5 ? 2 : 1 });
        return;
      }
      if (!fine.matches || target.closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return; /* 正在选字时不打扰 */
      api(event.clientX, event.clientY, { tiny: true, count: Math.random() < 0.5 ? 2 : 3 });
    };
    window.addEventListener("click", onClick, { passive: true });
    return () => {
      window.removeEventListener("click", onClick);
      if (window.deniaBubble === api) delete window.deniaBubble;
      host.replaceChildren();
    };
  }, []);
  return <div className="denia-bubbles" ref={layer} aria-hidden="true" />;
}
