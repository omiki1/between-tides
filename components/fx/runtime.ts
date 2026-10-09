/* 小样共用：空闲调度 + 只在可见时跑的 rAF 循环。 */

/** 首屏画完（load）且浏览器空闲后再执行；返回取消函数 */
export function whenIdle(fn: () => void, timeout = 4000): () => void {
  let cancelled = false, idleId = 0, timer = 0;
  const run = () => {
    if (cancelled) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => { if (!cancelled) fn(); }, { timeout });
    else timer = window.setTimeout(() => { if (!cancelled) fn(); }, 600);
  };
  const onLoad = () => { timer = window.setTimeout(run, 300); };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", onLoad);
    clearTimeout(timer);
    (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
  };
}

/** devicePixelRatio 上限 2（手机再压到 1.5，仍 ≤ 2） */
export function cappedDpr(mobile: boolean) {
  return Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
}

/**
 * rAF 循环：target 滚出视口（IntersectionObserver）或标签页切走（visibilitychange）时
 * 直接 cancelAnimationFrame，不再请求下一帧；回来后重新开始。
 * frame 返回 false 表示画面已静止，可以暂停到下一次 wake()。
 */
export function visibleLoop(target: Element, frame: (dt: number, now: number) => boolean | void) {
  let raf = 0, last = 0, inView = false, running = false, disposed = false;
  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min(50, last ? now - last : 16.7);
    last = now;
    const keep = frame(dt, now);
    if (keep === false) { running = false; last = 0; return; }
    raf = requestAnimationFrame(tick);
  };
  const canRun = () => !disposed && inView && document.visibilityState === "visible";
  const start = () => { if (!raf && canRun()) { running = true; last = 0; raf = requestAnimationFrame(tick); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; running = false; };
  const io = new IntersectionObserver(entries => {
    inView = entries[entries.length - 1].isIntersecting;
    if (inView) start(); else stop();
  });
  io.observe(target);
  const onVis = () => (document.visibilityState === "visible" ? start() : stop());
  document.addEventListener("visibilitychange", onVis);
  return {
    wake: start,
    get running() { return running; },
    dispose() { disposed = true; stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); },
  };
}

export const PASSIVE: AddEventListenerOptions = { passive: true };
