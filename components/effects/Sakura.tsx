"use client";
/** Petal artwork adapted from Firefly / Aemeath SakuraEffect (MIT). */
import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  AMBIANCE_EVENT,
  readAmbiance,
  sakuraCounts,
  shouldReduceMotion,
} from "./ambiance";

export function Sakura() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!resolvedTheme) return;
    const reducedMq = matchMedia("(prefers-reduced-motion: reduce)");
    const night = resolvedTheme === "dark";
    const canvas = document.createElement("canvas");
    canvas.id = "seasonal-weather";
    canvas.dataset.weather = night ? "rain" : "sakura";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:25;opacity:.78";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    let width = innerWidth, height = innerHeight, frame = 0, previous = 0, ready = night, disposed = false;
    let particles: { x: number; y: number; size: number; rotation: number; phase: number }[] = [];

    const rebuild = () => {
      const prefs = readAmbiance();
      const count = sakuraCounts(prefs.density, night);
      particles = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        // day petals ~1.32x original; night rain keeps thicker drops
        size: night ? (.7 + Math.random() * .95) : ((.4 + Math.random() * .6) * (1.35 + Math.random() * .25)),
        rotation: Math.random() * 6,
        phase: Math.random() * 6,
      }));
      canvas.style.opacity = count === 0 ? "0" : ".78";
      sync();
    };

    const resize = () => {
      width = innerWidth; height = innerHeight;
      const scale = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * scale; canvas.height = height * scale;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, .035) : 0;
      previous = now;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y += dt * (night ? 420 + p.size * 200 : 34 + p.size * 28) / height;
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
          ctx.globalAlpha = .38 + p.size * .32; ctx.rotate(p.rotation);
          ctx.drawImage(img, -12 * p.size, -12 * p.size, 24 * p.size, 24 * p.size);
        }
        ctx.restore();
      }
      frame = requestAnimationFrame(draw);
    };

    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      ctx.clearRect(0, 0, width, height);
      const prefs = readAmbiance();
      const pause = shouldReduceMotion(prefs.motion, reducedMq.matches) || particles.length === 0;
      if (!disposed && ready && !pause && !document.hidden) frame = requestAnimationFrame(draw);
    };

    img.onload = () => { ready = true; sync(); };
    img.src = "/assets/images/effects/sakura.webp";
    resize(); document.body.appendChild(canvas); rebuild();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    reducedMq.addEventListener("change", sync);
    const onAmbiance = () => rebuild();
    window.addEventListener(AMBIANCE_EVENT, onAmbiance);
    window.addEventListener("storage", onAmbiance);
    return () => {
      disposed = true; cancelAnimationFrame(frame); canvas.remove();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
      reducedMq.removeEventListener("change", sync);
      window.removeEventListener(AMBIANCE_EVENT, onAmbiance);
      window.removeEventListener("storage", onAmbiance);
      img.onload = null;
    };
  }, [resolvedTheme]);
  return null;
}
