"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/*
 * 仅站长可见的入口：本地标记存在时才渲染；访客的静态 HTML 里没有它。
 * 标记的开关见下方 sync()；组件在 load 之后才懒加载（见 DeferredEffects）。
 */
const KEY = "omiki-owner";
const HREF = "https://blog." + "omiki.cc" + "/admin";
const LABEL = "→ 博客后台";

type OwnerWin = Window & { __ownerCmd?: { label: string; href: string } };

export function OwnerLink() {
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    try {
      const url = new URL(location.href);
      const q = url.searchParams.get("owner");
      if (q === "1") localStorage.setItem(KEY, "1");
      else if (q === "0") localStorage.removeItem(KEY);
      if (q !== null) {
        url.searchParams.delete("owner");
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      }
      if (localStorage.getItem(KEY) !== "1") { delete (window as OwnerWin).__ownerCmd; return; }
    } catch { return; }
    (window as OwnerWin).__ownerCmd = { label: LABEL, href: HREF };
    const find = () => document.querySelector(".footer-top > div");
    setHost(find());
    return () => { delete (window as OwnerWin).__ownerCmd; };
  }, []);
  if (!host) return null;
  return createPortal(<a href={HREF} target="_blank" rel="noopener noreferrer" className="owner-link">{LABEL}</a>, host);
}