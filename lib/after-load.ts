"use client";
import { useEffect, useState } from "react";

/**
 * 「页面加载完、主线程空闲之后」的统一闸门：达妮娅泡泡、花瓣/夜雨画布、指针光晕、动态壁纸、
 * 台词轮播、分隔线动画等装饰效果都等它放行，首屏绘制和水合期间不抢主线程。
 *
 * 放行条件（先到先得，全站只放行一次）：
 *   - window load 之后的第一个 requestIdleCallback（不支持时退回 setTimeout）；
 *   - 或者用户已经开始交互（pointerdown / keydown / touchstart / wheel）——这时立刻放行，不让人等。
 */
let released = false;
const waiters = new Set<() => void>();

function release() {
  if (released) return;
  released = true;
  for (const fn of waiters) fn();
  waiters.clear();
  for (const type of INTERACTION) window.removeEventListener(type, release, true);
}

const INTERACTION = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
let armed = false;

function arm() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  for (const type of INTERACTION) window.addEventListener(type, release, { capture: true, passive: true });
  const idle = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(release, { timeout: 2500 });
    else window.setTimeout(release, 600);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

/** 加载完且空闲后调用 fn；返回取消函数。 */
export function afterLoadIdle(fn: () => void): () => void {
  if (released) {
    fn();
    return () => {};
  }
  arm();
  waiters.add(fn);
  return () => { waiters.delete(fn); };
}

/** React 版：放行前 false，之后 true。 */
export function useAfterLoad(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => afterLoadIdle(() => setReady(true)), []);
  return ready;
}

/** 手机 / 窄屏 / 粗指针：装饰效果减量。 */
export function isLiteDevice(): boolean {
  if (typeof window === "undefined") return false;
  return matchMedia("(pointer: coarse), (max-width: 700px)").matches;
}
