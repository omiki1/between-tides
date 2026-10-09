"use client";
/* 效果总开关：首屏画完、浏览器空闲后，才按开关动态 import 各效果（各自独立分块，首屏 JS 不增加）。
 * 用法：app/layout.tsx 挂一次 <FxBoot/>；样式在 styles/fx.css。删掉这两处即可整体回滚。 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { activeFx, motionReduced } from "./flags";
import { whenIdle } from "./runtime";

export function FxBoot() {
  const pathname = usePathname();
  useEffect(() => {
    const fx = activeFx();
    const root = document.documentElement;
    root.dataset.fx = fx.join(" ");
    if (!fx.length) return;
    const cleanups: (() => void)[] = [];
    let dead = false;
    const keep = (fn: () => void) => { if (dead) fn(); else cleanups.push(fn); };
    const cancel = whenIdle(() => {
      const reduced = motionReduced();
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (fx.includes("glass") && !reduced && fine) {
        import("./glass").then(m => keep(m.mountGlass()));
      }
    });
    return () => { dead = true; cancel(); cleanups.forEach(fn => fn()); };
  }, [pathname]);
  return null;
}
