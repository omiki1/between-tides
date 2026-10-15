"use client";
import { useEffect, useState } from "react";
import { site } from "@/config/site";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

/** First-visit welcome chip; once per browser. */
export function WelcomeToast() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("between-tides.welcome.v1") === "1") return;
      /* 首屏不弹（Hero 左下有 Q 版小人）：第一次滚动 160px 后出现，或停留 12 秒后出现 */
      const show = () => setOpen(true);
      const onScroll = () => { if (window.scrollY > 160) { cleanup(); show(); } };
      const t = window.setTimeout(() => { cleanup(); show(); }, 12000);
      const cleanup = () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); };
      window.addEventListener("scroll", onScroll, { passive: true });
      return cleanup;
    } catch {
      /* ignore */
    }
  }, []);
  /* 不打扰：出现 7 秒后自动收起（同样记为已读） */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(dismiss, 7000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  function dismiss() {
    try {
      localStorage.setItem("between-tides.welcome.v1", "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }
  if (!open) return null;
  return (
    <div className="welcome-toast" role="status">
      <div>
        <strong>
          {greeting()}，欢迎来到{site.name}
        </strong>
        <p>慢一点逛也没关系——{site.tagline}</p>
      </div>
      <button type="button" onClick={dismiss}>
        好的
      </button>
    </div>
  );
}