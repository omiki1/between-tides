"use client";
import { useMemo, useSyncExternalStore } from "react";
function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, 1000);
  window.addEventListener("focus", onChange);
  return () => { clearInterval(interval); window.removeEventListener("focus", onChange); };
}
const snapshot = () => Math.floor(Date.now() / 60000) * 60000;
const serverSnapshot = () => null;
export function useLocalClock() {
  const minute = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => minute === null ? null : new Date(minute), [minute]);
}
