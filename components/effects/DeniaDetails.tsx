"use client";
import { useEffect } from "react";
import voices from "@/data/denia-voices.json";

/**
 * 两个不占版面的小细节，挂在根布局里：
 * 1. 切到别的标签页时，标题换成一句达妮娅的话；回来时还原。
 * 2. 打开控制台能看到一句招呼（每次整页加载只打一次）。
 */
const AWAY_TITLE = "达妮娅在等你回来～";

export function DeniaDetails() {
  useEffect(() => {
    let saved = "";
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (document.title === AWAY_TITLE) return;
        saved = document.title;
        document.title = AWAY_TITLE;
      } else if (saved && document.title === AWAY_TITLE) {
        // 只在标题仍是我们改的那句时还原，期间若路由已更新了标题就不覆盖
        document.title = saved;
        saved = "";
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const w = window as Window & { __deniaHello?: boolean };
    if (!w.__deniaHello) {
      w.__deniaHello = true;
      const pool = voices.filter((v) => !v.text.includes("秘密"));
      const line = pool[Math.floor(Math.random() * pool.length)]?.text ?? "感觉身体变轻了。";
      console.log(
        "%c 幻想收束点 %c 达妮娅 %c\n\n" + line + "\n有人在这藏了秘密？——嗯，被你找到啦。慢慢逛，不着急。\n",
        "background:#f6a8c8;color:#3a2533;padding:3px 8px;border-radius:8px 0 0 8px;font-weight:600",
        "background:#9cc8f2;color:#1f3047;padding:3px 8px;border-radius:0 8px 8px 0;font-weight:600",
        "color:#c98bb0;font-size:12px;line-height:1.7",
      );
    }
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return null;
}
