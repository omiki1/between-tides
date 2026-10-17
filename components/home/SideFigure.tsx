"use client";
import { useEffect, useRef, useState } from "react";
import { afterLoadIdle } from "@/lib/after-load";
import "@/styles/side-figure.css";

/*
 * 首页左侧栏末尾的装饰立绘：左栏卡片结束后，下方正文旁边那一大片空白里站一个人。
 * - 先渲染固定比例的空盒子（CLS 0）；window load 之后、且盒子接近视口（400px）时才挂上 <img>，不抢 LCP。
 * - 无文字、无指针事件；侧栏变成单列堆叠（<=980px）后整块 display:none，也不会去取图。
 */
export function SideFigure() {
  const box = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || getComputedStyle(el).display === "none") return;
    let loaded = false, near = false, done = false;
    const go = () => { if (!done && loaded && near) { done = true; setArmed(true); } };
    const cancel = afterLoadIdle(() => { loaded = true; go(); });
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = !!e?.isIntersecting; go(); }, { rootMargin: "400px" })
      : null;
    if (io) io.observe(el); else { near = true; go(); }
    return () => { cancel(); io?.disconnect(); };
  }, []);
  return (
    <figure className="side-figure" aria-hidden="true" ref={box}>
      <div className="side-figure__box">
        {armed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/art/miku-cutout.webp" width={382} height={765} alt="" decoding="async" draggable={false} />
        )}
      </div>
    </figure>
  );
}