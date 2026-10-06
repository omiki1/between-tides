"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Compass, Search, X } from "lucide-react";
import { site } from "@/config/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const base = href.replace(/\/$/, "");
  return pathname === base || pathname.startsWith(base + "/");
}

/** Phone-only floating nav orb. Hidden on desktop via CSS. */
export function MobileFabNav() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const close = () => setOpenPath(null);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPath(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="mobile-fab-nav" data-open={open ? "1" : "0"}>
      <button
        type="button"
        className="mobile-fab-orb"
        aria-label={open ? "关闭导航" : "打开导航"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        {open ? <X size={20} strokeWidth={2.25} /> : <Compass size={20} strokeWidth={2.25} />}
      </button>

      <div
        className="mobile-fab-scrim"
        hidden={!open}
        onClick={() => close()}
        aria-hidden="true"
      />

      <div
        id={panelId}
        className="mobile-fab-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="站点导航"
        hidden={!open}
      >
        <header className="mobile-fab-sheet-head">
          <div>
            <p className="mobile-fab-eyebrow">{site.wordmark}</p>
            <h2>去哪儿逛？</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="icon-button"
            aria-label="关闭导航"
            onClick={() => close()}
          >
            <X size={20} />
          </button>
        </header>
        <nav className="mobile-fab-links" aria-label="移动浮窗导航">
          <button
            type="button"
            className="mobile-fab-search"
            onClick={() => {
              close();
              requestAnimationFrame(() => window.dispatchEvent(new Event("open-search")));
            }}
          >
            <Search size={16} aria-hidden="true" />
            搜索
          </button>
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              onClick={() => close()}
            >
              {item.label}
            </Link>
          ))}
          {site.github ? (
            <a href={site.github} target="_blank" rel="me noreferrer" onClick={() => close()}>
              GitHub
            </a>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
