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
      const t = window.setTimeout(() => setOpen(true), 900);
      return () => window.clearTimeout(t);
    } catch {
      /* ignore */
    }
  }, []);
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