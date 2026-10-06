"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  // 切换时用 View Transitions 做一道约 0.5s 的柔光扫过；不支持或减弱动效时直接切。
  const switchTo = (next: "dark" | "light") => {
    if (resolvedTheme === next) return;
    const root = document.documentElement;
    const doc = document as Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };
    const quiet = matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.ambianceMotion === "reduce";
    if (!doc.startViewTransition || quiet) { setTheme(next); return; }
    root.classList.add("denia-vt");
    const transition = doc.startViewTransition(() => {
      root.classList.remove("dark", "light");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    });
    transition.finished.finally(() => root.classList.remove("denia-vt"));
  };
  return <div className="theme-switch" role="group" aria-label="网站双主题">
    <button type="button" className="theme-night" aria-label="夜间主题" aria-pressed={mounted && resolvedTheme === "dark"} title="夜间" onClick={() => switchTo("dark")}><Moon size={13}/><span>夜间</span></button>
    <button type="button" className="theme-dream" aria-label="日间主题" aria-pressed={mounted && resolvedTheme === "light"} title="日间" onClick={() => switchTo("light")}><Sun size={13}/><span>日间</span></button>
  </div>;
}
