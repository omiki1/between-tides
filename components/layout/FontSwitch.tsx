"use client";
/** Adapted from Firefly / Aemeath FontSwitch (MIT). */
import { useSyncExternalStore } from "react";

const KEY = "firefly-font-mode";
type Mode = "wenkai" | "original";

function subscribe(callback: () => void) { window.addEventListener("site-font", callback); return () => window.removeEventListener("site-font", callback); }
const snapshot = (): Mode => document.documentElement.dataset.fontMode === "original" ? "original" : "wenkai";
const serverSnapshot = (): Mode => "wenkai";
export function FontSwitch() {
  const mode = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function toggle() {
    const next: Mode = mode === "wenkai" ? "original" : "wenkai";

    document.documentElement.dataset.fontMode = next;
    try { localStorage.setItem(KEY, next); } catch { /* In-memory preference still works when storage is unavailable. */ }
    window.dispatchEvent(new Event("site-font"));
  }
  return (
    <button
      type="button"
      className={`font-switch ${mode === "wenkai" ? "active" : ""}`}
      aria-pressed={mode === "wenkai"}
      aria-label={mode === "wenkai" ? "切换到原字体" : "切换到霞鹜文楷"}
      title={mode === "wenkai" ? "切换到原字体" : "切换到霞鹜文楷"}
      onClick={toggle}
    >
      文
    </button>
  );
}
