"use client";
import { useEffect } from "react";

type DeniaBubble = (x: number, y: number, options: { text: string }) => void;
const DONE = "复制好啦";

/**
 * 给文章正文里的每个代码块加一个「复制」按钮。
 * 正文是 dangerouslySetInnerHTML 输出的静态 HTML，React 不会再协调它的子节点，
 * 所以这里在挂载后把 <pre> 包进 .ft-code，再把按钮放在包裹层上（不随代码横向滚动）。
 *
 * 复制成功：若 ui师 的点击泡泡暴露了 window.deniaBubble(x, y, { text })，就在按钮处冒一个泡泡；
 * 否则退回为按钮文字临时变成「复制好啦」。两种情况都会更新读屏用的 live region。
 */
export function CodeCopy({ root = ".prose" }: { root?: string }) {
  useEffect(() => {
    const container = document.querySelector(root);
    if (!container) return;
    const live = document.createElement("span");
    live.className = "ft-sr-only";
    live.setAttribute("aria-live", "polite");
    container.after(live);
    const timers = new Set<number>();
    const added: HTMLElement[] = [];

    for (const pre of Array.from(container.querySelectorAll<HTMLPreElement>("pre"))) {
      if (pre.parentElement?.classList.contains("ft-code")) continue;
      const wrap = document.createElement("div");
      wrap.className = "ft-code";
      pre.before(wrap);
      wrap.append(pre);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ft-copy";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制这段代码");
      button.setAttribute("data-pagefind-ignore", "all");
      button.addEventListener("click", async () => {
        const text = (pre.querySelector("code") ?? pre).textContent ?? "";
        const ok = await copyText(text);
        const message = ok ? DONE : "没复制上…再点一次？";
        live.textContent = "";
        live.textContent = message;
        const bubble = (window as Window & { deniaBubble?: DeniaBubble }).deniaBubble;
        if (ok && typeof bubble === "function") {
          const rect = button.getBoundingClientRect();
          bubble(rect.left + rect.width / 2, rect.top + rect.height / 2, { text: DONE });
          return;
        }
        button.textContent = message;
        button.classList.toggle("is-done", ok);
        const timer = window.setTimeout(() => {
          button.textContent = "复制";
          button.classList.remove("is-done");
          timers.delete(timer);
        }, 1600);
        timers.add(timer);
      });
      wrap.append(button);
      added.push(wrap);
    }
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      live.remove();
      for (const wrap of added) {
        const pre = wrap.querySelector("pre");
        if (pre) wrap.before(pre);
        wrap.remove();
      }
    };
  }, [root]);
  return null;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* 落到下面的旧办法 */ }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
