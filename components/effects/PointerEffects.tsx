"use client";
import { useEffect, useRef } from "react";

const CARD = [
  ".widget-card:not(.live-wallpaper):not(.sakura-pick):not(.reaction-test):not(.beat-tap)",
  ".now-panel",
  ".music-panel",
  ".aside-card",
  ".project-card",
  ".album-card",
  ".interest-grid article",
  ".featured-work-layout",
  ".post-table a",
  ".friend-card",
  ".taxonomy-card",
  ".start-grid a",
  ".post-pager a",
  ".steam-card",
].join(",");

export function PointerEffects() {
  const layer = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    let frame = 0;
    let card: HTMLElement | null = null;
    const animations = new Set<Animation>();
    const release = (node: HTMLElement | null) => {
      if (!node) return;
      node.style.setProperty("--rx", "0deg");
      node.style.setProperty("--ry", "0deg");
      node.classList.remove("is-ix");
    };
    const hide = () => {
      if (halo.current) {
        halo.current.style.opacity = "0";
        halo.current.classList.remove("over-card", "over-control");
      }
      cancelAnimationFrame(frame);
      release(card);
      card = null;
    };
    const clear = () => {
      hide();
      for (const animation of animations) animation.cancel();
    };
    const track = (x: number, y: number, target: EventTarget | null) => {
      const quiet = document.documentElement.dataset.ambianceMotion === "reduce";
      const next = !quiet && target instanceof Element ? target.closest(CARD) : null;
      const found = next instanceof HTMLElement ? next : null;
      if (found !== card) {
        release(card);
        card = found;
      }
      halo.current?.classList.toggle("over-card", !!card);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;
      const px = (x - rect.left) / rect.width;
      const py = (y - rect.top) / rect.height;
      let amp = rect.width > 560 ? 2.4 : 4.2;
      if (card.classList.contains("music-panel")) amp = 1.2;
      card.style.setProperty("--ry", `${((px - 0.5) * amp * 2).toFixed(3)}deg`);
      card.style.setProperty("--rx", `${((py - 0.5) * -amp * 1.5).toFixed(3)}deg`);
      card.style.setProperty("--spot-x", `${(px * 100).toFixed(2)}%`);
      card.style.setProperty("--spot-y", `${(py * 100).toFixed(2)}%`);
      card.classList.add("is-ix");
    };
    const move = (event: PointerEvent) => {
      if (preference.matches || event.pointerType !== "mouse") {
        cancelAnimationFrame(frame);
        release(card);
        card = null;
        halo.current?.classList.remove("over-card");
        return;
      }
      const x = event.clientX;
      const y = event.clientY;
      const target = event.target;
      const overControl = target instanceof Element && !!target.closest("a,button,input,summary,[role=button]");
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!halo.current) return;
        halo.current.style.opacity = "1";
        halo.current.style.transform = `translate3d(${x}px,${y}px,0)`;
        halo.current.classList.toggle("over-control", overControl);
        track(x, y, target);
      });
    };
    const click = (event: PointerEvent) => {
      if (preference.matches || event.button !== 0 || !layer.current || animations.size > 35) return;
      const night = document.documentElement.classList.contains("dark");
      const spawn = (element: HTMLElement, keyframes: Keyframe[], duration: number) => {
        element.style.left = `${event.clientX}px`;
        element.style.top = `${event.clientY}px`;
        layer.current?.appendChild(element);
        const animation = element.animate(keyframes, { duration, easing: "cubic-bezier(.16,1,.3,1)" });
        animations.add(animation);
        const finish = () => { element.remove(); animations.delete(animation); };
        animation.onfinish = finish;
        animation.oncancel = finish;
      };
      for (let i = 0; i < 6; i++) {
        const element = document.createElement("i");
        element.className = i === 0 ? "pointer-ripple" : "pointer-spark";
        const angle = i * Math.PI * 2 / 5;
        const distance = 30 + Math.random() * 28;
        spawn(element, i === 0 ? [
          { transform: "translate(-50%,-50%) scale(.2)", opacity: .72 },
          { transform: "translate(-50%,-50%) scale(3.6)", opacity: 0 },
        ] : [
          { transform: "translate(-50%,-50%) scale(.35)", opacity: .9 },
          { transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance + (night ? 12 : 0)}px) rotate(80deg) scale(.1)`, opacity: 0 },
        ], i === 0 ? 780 : 640 + i * 60);
      }
      /* 泡泡统一交给 DeniaBubbles（window.deniaBubble），这里只保留涟漪与火花 */
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", clear);
    preference.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", clear);
      preference.removeEventListener("change", clear);
    };
  }, []);
  return <div className="pointer-effects" ref={layer} aria-hidden="true"><div className="pointer-halo" ref={halo}/></div>;
}
