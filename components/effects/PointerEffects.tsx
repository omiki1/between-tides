"use client";
import { useEffect, useRef } from "react";
export function PointerEffects() {
  const layer = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    let frame = 0;
    const animations = new Set<Animation>();
    const hide = () => { if (halo.current) halo.current.style.opacity = "0"; };
    const clear = () => { hide(); cancelAnimationFrame(frame); for (const animation of animations) animation.cancel(); };
    const move = (event: PointerEvent) => {
      if (preference.matches || event.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!halo.current) return;
        halo.current.style.opacity = "1";
        halo.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
        halo.current.classList.toggle("over-control", !!(event.target instanceof Element && event.target.closest("a,button,input,summary,[role=button]")));
      });
    };
    const click = (event: PointerEvent) => {
      if (preference.matches || event.button !== 0 || !layer.current || animations.size > 35) return;
      const night = document.documentElement.classList.contains("dark");
      for (let i = 0; i < 6; i++) {
        const element = document.createElement("i");
        element.className = i === 0 ? "pointer-ripple" : "pointer-spark";
        element.style.left = `${event.clientX}px`; element.style.top = `${event.clientY}px`;
        layer.current.appendChild(element);
        const angle = i * Math.PI * 2 / 5, distance = 22 + Math.random() * 23;
        const animation = element.animate(i === 0 ? [
          { transform: "translate(-50%,-50%) scale(.2)", opacity: .6 },
          { transform: "translate(-50%,-50%) scale(2.8)", opacity: 0 },
        ] : [
          { transform: "translate(-50%,-50%) scale(.3)", opacity: .85 },
          { transform: `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance + (night ? 12 : 0)}px) rotate(80deg) scale(.1)`, opacity: 0 },
        ], { duration: i === 0 ? 700 : 600 + i * 60, easing: "cubic-bezier(.16,1,.3,1)" });
        animations.add(animation);
        const finish = () => { element.remove(); animations.delete(animation); };
        animation.onfinish = finish; animation.oncancel = finish;
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", clear);
    preference.addEventListener("change", clear);
    return () => { clear(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", click); document.documentElement.removeEventListener("pointerleave", hide); window.removeEventListener("blur", clear); preference.removeEventListener("change", clear); };
  }, []);
  return <div className="pointer-effects" ref={layer} aria-hidden="true"><div className="pointer-halo" ref={halo}/></div>;
}
