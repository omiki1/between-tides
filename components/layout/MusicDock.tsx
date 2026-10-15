"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MusicPlayer } from "@/components/home/MusicPlayer";

/*
 * 首页的播放器是 absolute 叠在「状态栏（.status-grid）」右侧那一栏上的。
 * 以前 top 写死成 684px，Hero 高度一变（视口宽度、字体、首屏内容）它就漂到 Hero 的 DENIA 铭牌/卡片上。
 * 现在每次布局变化都按 .status-grid 的真实位置重新对齐；窄屏（<=700px）CSS 里是 static，不参与。
 */
export function MusicDock() {
  const pathname = usePathname();
  const home = pathname === "/";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!home) return;
    const wrap = ref.current;
    if (!wrap) return;
    let raf = 0;
    const place = () => {
      raf = 0;
      const grid = document.querySelector(".status-grid");
      const parent = wrap.offsetParent as HTMLElement | null;
      if (!grid || getComputedStyle(wrap).position !== "absolute") { wrap.style.top = ""; return; }
      const base = parent ? parent.getBoundingClientRect().top : -scrollY;
      wrap.style.top = `${Math.round(grid.getBoundingClientRect().top - base)}px`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(place); };
    place();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const hero = document.querySelector(".hero");
    if (hero) ro.observe(hero);
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    document.fonts?.ready.then(schedule);
    return () => { ro.disconnect(); window.removeEventListener("resize", schedule); window.removeEventListener("load", schedule); if (raf) cancelAnimationFrame(raf); };
  }, [home]);
  const wrap = home ? "home-music-wrap container" : "inner-music-wrap container";
  return <div ref={ref} className={wrap}><MusicPlayer /></div>;
}