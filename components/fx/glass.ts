/* 虹彩玻璃卡片：薄膜干涉光泽 + 光斑跟随指针，轻微 3D 倾斜。只在 (hover:hover) and (pointer:fine) 设备挂载。
 * 不往卡片里插 DOM、不占用卡片的 ::before/::after（ui师 已在用）：
 * 全站只有一个 fixed 的光泽层，悬停时贴到当前卡片上，并做与卡片相同的 transform。 */
import { PASSIVE } from "./runtime";

export const GLASS_TARGETS = [
  ".widget-card:not(.live-wallpaper):not(.sakura-pick):not(.reaction-test):not(.beat-tap)",
  ".aside-card", ".project-card", ".featured-post", ".album-card", ".taxonomy-card",
  ".friend-card", ".steam-card", ".now-panel",
].join(",");
const MAX_TILT = 5; // deg

export function mountGlass() {
  const sheen = document.createElement("div");
  sheen.className = "fx-glass-sheen"; sheen.setAttribute("aria-hidden", "true");
  document.body.append(sheen);
  let card: HTMLElement | null = null, raf = 0;
  let pageX = 0, pageY = 0, w = 0, h = 0, mx = .5, my = .5;

  const place = () => {
    raf = 0;
    if (!card) return;
    const rx = (.5 - my) * MAX_TILT * 2, ry = (mx - .5) * MAX_TILT * 2;
    const vars: [string, string][] = [["--fx-rx", `${rx.toFixed(2)}deg`], ["--fx-ry", `${ry.toFixed(2)}deg`], ["--fx-mx", `${(mx * 100).toFixed(1)}%`], ["--fx-my", `${(my * 100).toFixed(1)}%`], ["--fx-ang", `${((mx + my) * 140).toFixed(1)}deg`]];
    for (const [k, v] of vars) { card.style.setProperty(k, v); sheen.style.setProperty(k, v); }
    sheen.style.transform = `translate3d(${pageX - scrollX}px,${pageY - scrollY}px,0) perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(place); };

  const enter = (next: HTMLElement) => {
    leave();
    card = next;
    // 读未倾斜时的盒子（此时还没加 data-fx-tilt）
    const b = card.getBoundingClientRect();
    pageX = b.left + scrollX; pageY = b.top + scrollY; w = b.width; h = b.height;
    sheen.style.width = `${w}px`; sheen.style.height = `${h}px`;
    sheen.style.borderRadius = getComputedStyle(card).borderRadius;
    card.dataset.fxTilt = "";
    sheen.classList.add("is-on");
  };
  const leave = () => {
    if (!card) return;
    const c = card; card = null;
    delete c.dataset.fxTilt;
    ["--fx-rx", "--fx-ry", "--fx-mx", "--fx-my", "--fx-ang"].forEach(k => c.style.removeProperty(k));
    sheen.classList.remove("is-on");
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const hit = (e.target as Element | null)?.closest?.<HTMLElement>(GLASS_TARGETS) ?? null;
    if (hit !== card) { if (hit && !hit.matches(":focus-visible, :has(:focus-visible)")) enter(hit); else leave(); }
  };
  const onMove = (e: PointerEvent) => {
    if (!card || e.pointerType !== "mouse") return;
    mx = Math.min(1, Math.max(0, (e.pageX - pageX) / w)); my = Math.min(1, Math.max(0, (e.pageY - pageY) / h));
    queue();
  };
  const onScroll = () => { if (card) queue(); };
  // 键盘聚焦（:focus-visible）到当前卡片或其内部时立即撤掉倾斜和光泽层，原有焦点环原样显示；
  // 倾斜只由鼠标 pointerover 触发，键盘/触屏永远不会进入 enter()
  const onFocus = (e: FocusEvent) => {
    const t = e.target as Element | null;
    if (card && t && card.contains(t) && t.matches?.(":focus-visible")) leave();
  };
  document.addEventListener("pointerover", onOver, PASSIVE);
  document.addEventListener("pointermove", onMove, PASSIVE);
  document.addEventListener("pointerleave", leave, PASSIVE);
  window.addEventListener("scroll", onScroll, PASSIVE);
  document.addEventListener("focusin", onFocus, PASSIVE);
  document.documentElement.dataset.fxGlass = "on";
  return () => {
    leave(); cancelAnimationFrame(raf); sheen.remove(); delete document.documentElement.dataset.fxGlass;
    document.removeEventListener("pointerover", onOver); document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", leave); window.removeEventListener("scroll", onScroll);
    document.removeEventListener("focusin", onFocus);
  };
}
