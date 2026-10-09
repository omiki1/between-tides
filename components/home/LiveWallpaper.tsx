"use client";

import { useEffect, useRef, useState } from "react";
import { afterLoadIdle } from "@/lib/after-load";

/**
 * Looping live wallpaper for the left rail.
 * Video is a muted crop of Denia's official expression short; canvas sky is the fallback.
 */
type Props = {
  /** Optional seamless loop video (webm/mp4). Falls back to canvas. */
  videoSrc?: string;
};

const PERIOD = 16; // seconds for one full loop

export function LiveWallpaper({ videoSrc = "/assets/wallpaper/loop.mp4" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const useVideoRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* 视频在页面 load 完、空闲、且卡片进入视口后才开始下载；离开视口或切走标签页就暂停 */
    let onScreen = false, started = false, allowed = false;
    const shouldPlay = () => useVideoRef.current && !reduced && onScreen && !document.hidden;
    const syncPlayback = () => {
      if (!useVideoRef.current) return;
      if (shouldPlay()) video.play().catch(() => {});
      else video.pause();
    };
    const maybeStart = () => {
      if (started || !allowed || !onScreen) return;
      started = true;
      video.preload = "auto";
      video.load();
    };
    const onReady = () => {
      useVideoRef.current = true;
      setVideoReady(true);
      if (!shouldPlay()) {
        video.pause();
        return;
      }
      video.play().catch(() => {
        useVideoRef.current = false;
        setVideoReady(false);
        video.dispatchEvent(new Event("wallpaper-fallback"));
      });
    };
    const onFail = () => {
      useVideoRef.current = false;
      setVideoReady(false);
    };
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onFail);
    const io = new IntersectionObserver(entries => {
      onScreen = entries.some(e => e.isIntersecting);
      maybeStart();
      syncPlayback();
    }, { rootMargin: "200px 0px" });
    io.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    const cancelIdle = afterLoadIdle(() => { allowed = true; maybeStart(); });
    return () => {
      cancelIdle();
      io.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onFail);
    };
  }, [videoSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* 尺寸由 ResizeObserver 缓存：每帧读 clientWidth 会强制整页样式重算 */
    let w = 0, h = 0, onScreen = false, allowed = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => { resize(); if (!raf) schedule(); });
    ro.observe(canvas);

    type Petal = { x: number; y: number; r: number; s: number; a: number; spin: number };
    const petals: Petal[] = Array.from({ length: 18 }, (_, i) => ({
      x: (i * 47) % 100,
      y: (i * 29) % 100,
      r: 3 + (i % 5),
      s: 0.25 + (i % 7) * 0.06,
      a: 0.25 + (i % 5) * 0.08,
      spin: (i % 3) - 1,
    }));

    /* 只在：加载完且空闲 + 画布在视口里 + 标签页可见 + 没有视频顶替 时才逐帧画；减弱动效时只画一帧 */
    const running = () => allowed && onScreen && !document.hidden && !useVideoRef.current;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = running() ? requestAnimationFrame(draw) : 0;
    };
    const draw = (now: number) => {
      raf = 0;
      if (!running()) return;
      const t = reduced ? 0 : ((now - start) / 1000) % PERIOD;
      const p = t / PERIOD; // 0..1 seamless

      // sky gradient shifts gently and returns
      const g = ctx.createLinearGradient(0, 0, 0, h);
      const pink = 0.55 + Math.sin(p * Math.PI * 2) * 0.08;
      g.addColorStop(0, `hsla(${210 + Math.sin(p * Math.PI * 2) * 8}, 70%, ${78 + pink * 8}%, 1)`);
      g.addColorStop(0.45, `hsla(${320 + Math.cos(p * Math.PI * 2) * 6}, 55%, 88%, 1)`);
      g.addColorStop(1, `hsla(${340}, 45%, 94%, 1)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // soft sun / moon glow
      const sx = w * (0.72 + Math.sin(p * Math.PI * 2) * 0.04);
      const sy = h * (0.22 + Math.cos(p * Math.PI * 2) * 0.03);
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.35);
      sun.addColorStop(0, "rgba(255,236,210,0.55)");
      sun.addColorStop(0.4, "rgba(255,190,210,0.18)");
      sun.addColorStop(1, "rgba(255,190,210,0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, h);

      // drifting cloud bands (periodic wrap = seamless)
      for (let i = 0; i < 4; i++) {
        const cy = h * (0.18 + i * 0.16);
        const cx = ((p + i * 0.23) % 1) * (w + 160) - 80;
        const cw = 70 + i * 18;
        ctx.fillStyle = `rgba(255,255,255,${0.22 + i * 0.04})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw, 18 + i * 3, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 28, cy + 4, cw * 0.7, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 24, cy + 6, cw * 0.55, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // petals — wrap vertically for seamless loop feel
      for (const petal of petals) {
        const y = ((petal.y / 100 + p * petal.s) % 1) * (h + 20) - 10;
        const x = ((petal.x / 100 + p * 0.15 * petal.spin) % 1) * w;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p * Math.PI * 2 * petal.spin + petal.x);
        ctx.fillStyle = `rgba(255,170,190,${petal.a})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.r, petal.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // soft vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
      vig.addColorStop(0, "rgba(255,255,255,0)");
      vig.addColorStop(1, "rgba(80,40,90,0.08)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(entries => { onScreen = entries.some(e => e.isIntersecting); schedule(); });
    io.observe(canvas);
    document.addEventListener("visibilitychange", schedule);
    const cancelIdle = afterLoadIdle(() => { allowed = true; schedule(); });
    /* 视频准备好/失败时重新判断要不要画（canplay/error 的处理器先于这里注册，ref 已更新） */
    const video = videoRef.current;
    video?.addEventListener("canplay", schedule);
    video?.addEventListener("error", schedule);
    video?.addEventListener("wallpaper-fallback", schedule);
    return () => {
      cancelIdle();
      cancelAnimationFrame(raf);
      video?.removeEventListener("canplay", schedule);
      video?.removeEventListener("error", schedule);
      video?.removeEventListener("wallpaper-fallback", schedule);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return (
    <article className="widget-card live-wallpaper" aria-label="循环画面">
      <div className="live-wallpaper-stage">
        <video
          ref={videoRef}
          className={"live-wallpaper-video" + (videoReady ? " is-ready" : "")}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="live-wallpaper-canvas" aria-hidden="true" />
      </div>
    </article>
  );
}
