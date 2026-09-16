"use client";
/** Petal artwork adapted from Firefly / Aemeath SakuraEffect (MIT). */
import { useEffect } from "react";
import { useTheme } from "next-themes";

export function Sakura() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!resolvedTheme) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const night = resolvedTheme === "dark";
    const canvas = document.createElement("canvas");
    canvas.id = "seasonal-weather";
    canvas.dataset.weather = night ? "rain" : "sakura";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:25;opacity:.65";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    let width = innerWidth, height = innerHeight, frame = 0, previous = 0, ready = night, disposed = false;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const scale = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const particles = Array.from({ length: night ? 42 : 18 }, () => ({ x: Math.random(), y: Math.random(), size: .4 + Math.random() * .6, rotation: Math.random() * 6, phase: Math.random() * 6 }));
    const draw = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, .035) : 0;
      previous = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += dt * (night ? 420 + p.size * 200 : 30 + p.size * 25) / height;
        p.x -= dt * (night ? 22 : 22 + Math.sin(now / 1600 + p.phase) * 17) / width;
        p.rotation += dt * .5;
        if (p.y > 1.06) { p.y = -.06; p.x = Math.random(); }
        if (p.x < -.04) p.x = 1.04;
        ctx.save(); ctx.translate(p.x * width, p.y * height);
        if (night) {
          ctx.globalAlpha = .12 + p.size * .3;
          const trail = ctx.createLinearGradient(0, 0, -1, 22 * p.size);
          trail.addColorStop(0, "rgba(169,203,255,0)"); trail.addColorStop(1, "rgba(194,216,255,.85)");
          ctx.strokeStyle = trail; ctx.lineWidth = .7 + p.size * .5;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-1, 22 * p.size); ctx.stroke();
        } else {
          ctx.globalAlpha = .35 + p.size * .4; ctx.rotate(p.rotation);
          ctx.drawImage(img, -12 * p.size, -12 * p.size, 24 * p.size, 24 * p.size);
        }
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      ctx.clearRect(0, 0, width, height);
      if (!disposed && ready && !reduced.matches && !document.hidden) frame = requestAnimationFrame(draw);
    };
    img.onload = () => { ready = true; sync(); };
    img.src = "/assets/images/effects/sakura.webp";
    resize(); document.body.appendChild(canvas); sync();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => { disposed = true; cancelAnimationFrame(frame); canvas.remove(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); img.onload = null; };
  }, [resolvedTheme]);
  return null;
}
