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
  return <div className="theme-switch" role="group" aria-label="网站双主题">
    <button type="button" className="theme-night" aria-label="夜间主题" aria-pressed={mounted && resolvedTheme === "dark"} title="夜间" onClick={() => setTheme("dark")}><Moon size={13}/><span>夜间</span></button>
    <button type="button" className="theme-dream" aria-label="日间主题" aria-pressed={mounted && resolvedTheme === "light"} title="日间" onClick={() => setTheme("light")}><Sun size={13}/><span>日间</span></button>
  </div>;
}
