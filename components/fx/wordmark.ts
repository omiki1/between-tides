/* 站名沙砾聚字（仅桌面）：细沙从四周向内汇聚成「幻想收束点」，约 1 秒聚拢完成后换回真实文字。
 * 文字始终在 DOM 里（SEO / 读屏 / 选中复制不受影响），画布 aria-hidden + pointer-events:none。
 * 配色：达妮娅粉 / 蓝 + 少量金。轨迹：ease-out + 轻微旋涡，落点停稳后淡出。 */
import { cappedDpr, visibleLoop } from "./runtime";

const PADX = 320, PADY = 170;              // 画布比文字外扩，沙从这片区域的四周飞进来
const DUR = 680, SPREAD = 380, SWIRL = .55; // 单粒 680ms，错峰 0–380ms → 约 1.06s 聚拢完成

export async function mountWordmark(el: HTMLElement) {
  const cs = getComputedStyle(el);
  // 注意：getComputedStyle().font 简写在很多情况下是空串，必须自己拼
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  // 必须等文楷真正到位再取样：回退字体（WenKai Fallback）度量虽一致，但字形不同，落点会和最终文字错位
  const sample = el.textContent || "";
  try { await Promise.all([document.fonts.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} "LXGW WenKai Screen"`, sample), document.fonts.ready]); } catch { /* 文楷加载失败就用回退字体取样 */ }
  if (!el.isConnected) return () => {};
  const text = (el.textContent || "").trim();
  const box = el.getBoundingClientRect();
  const W = Math.ceil(box.width) + PADX * 2, H = Math.ceil(box.height) + PADY * 2;
  const dpr = cappedDpr(false); // ≤ 2

  // 1) 离屏取样：按 DOM 的行盒位置画同一行字
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const o = off.getContext("2d", { willReadFrequently: true })!;
  o.font = font;
  (o as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  // 基线和左边直接从 DOM 量：在文字末尾临时插一个 0×0 的 inline-block（它的底边就是这行的基线），
  // 不依赖 canvas 的字体度量（文楷 / WenKai Fallback 带 ascent-override，canvas 读到的度量会差 1px 左右）
  const span = (el.querySelector(".fx-wordmark-text") as HTMLElement | null) ?? el;
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  span.append(probe);
  const baseY = probe.getBoundingClientRect().bottom - box.top, left = span.getBoundingClientRect().left - box.left;
  probe.remove();
  o.fillStyle = "#000"; o.textBaseline = "alphabetic";
  o.fillText(text, PADX + left, PADY + baseY);
  const data = o.getImageData(0, 0, W, H).data;
  off.width = off.height = 0;
  const gap = Math.max(2, Math.round(parseFloat(cs.fontSize) / 28));
  const tx: number[] = [], ty: number[] = [];
  for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) {
    if (data[(y * W + x) * 4 + 3] > 120) { tx.push(x + (Math.random() - .5) * gap * .6); ty.push(y + (Math.random() - .5) * gap * .6); }
  }
  const N = tx.length;
  if (!N) return () => {};

  // 2) 起点：沿「画布中心 → 落点」方向延长到画布边缘外一点；另有 35% 撒在四条边上 → 四周向内汇聚
  const sx = new Float32Array(N), sy = new Float32Array(N), dl = new Float32Array(N), cl = new Uint8Array(N);
  const cx = W / 2, cy = H / 2;
  for (let i = 0; i < N; i++) {
    if (Math.random() < .35) {
      const side = (Math.random() * 4) | 0, u = Math.random(), j = Math.random() * 24;
      sx[i] = side === 0 ? j : side === 1 ? W - j : u * W;
      sy[i] = side === 2 ? j : side === 3 ? H - j : u * H;
    } else {
      let dx = tx[i] - cx, dy = ty[i] - cy; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      const hit = Math.min(dx ? (dx > 0 ? W - cx : cx) / Math.abs(dx) : 1e9, dy ? (dy > 0 ? H - cy : cy) / Math.abs(dy) : 1e9);
      const r = hit * (.9 + Math.random() * .12), jt = (Math.random() - .5) * 60;
      sx[i] = cx + dx * r - dy * jt; sy[i] = cy + dy * r + dx * jt;
    }
    dl[i] = Math.random() * SPREAD;
    cl[i] = Math.random() < .09 ? 2 : (tx[i] / W + (Math.random() - .5) * .3 < .5 ? 0 : 1);
  }

  // 3) 画布覆盖在文字上方
  const canvas = document.createElement("canvas");
  canvas.className = "fx-wordmark-canvas"; canvas.setAttribute("aria-hidden", "true");
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.cssText = `left:${-PADX}px;top:${-PADY}px;width:${W}px;height:${H}px`;
  el.append(canvas);
  el.dataset.fxState = "particles"; // CSS：文字暂时透明，画布可见
  try { performance.mark("fx-wordmark:start", { detail: { particles: N } }); } catch { /* noop */ }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const light = document.documentElement.classList.contains("light");
  const COL = light ? ["#d9739a", "#6d84cc", "#c4943a"] : ["#f3b7c9", "#9fb4ee", "#ecd08f"]; // 粉 / 蓝 / 金
  const size = 1.3, off0 = .5 - size / 2; // 取样点是像素左上角，画的小方块以像素中心为中心
  const ease = (t: number) => { t = 1 - t; return 1 - t * t * t; }; // ease-out cubic：越近越慢，最后在落点停稳

  let t0 = 0; const cost: number[] = [];
  const step = (_dt: number, now: number) => {
    const c0 = performance.now();
    if (!t0) t0 = now;
    const age = now - t0; // 墙钟：掉帧时少画几帧，不拖长
    ctx.clearRect(0, 0, W, H);
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = COL[c];
      for (let i = 0; i < N; i++) {
        if (cl[i] !== c) continue;
        let p = (age - dl[i]) / DUR; p = p < 0 ? 0 : p > 1 ? 1 : p;
        const k = 1 - ease(p), a = SWIRL * k, ca = Math.cos(a), sa = Math.sin(a);
        const rx = (sx[i] - tx[i]) * k, ry = (sy[i] - ty[i]) * k;
        ctx.fillRect(tx[i] + rx * ca - ry * sa + off0, ty[i] + rx * sa + ry * ca + off0, size, size);
      }
    }
    // 4) 聚拢完成 → 换回真实文字（CSS 交叉淡化），循环停止
    cost.push(performance.now() - c0);
    if (age >= DUR + SPREAD) {
      el.dataset.fxState = "text";
      try { performance.mark("fx-wordmark:end", { detail: { frames: cost.length, frameMs: cost.map(v => Math.round(v * 100) / 100) } }); } catch { /* noop */ }
      return false;
    }
  };
  const loop = visibleLoop(el, step);

  return () => {
    loop.dispose(); canvas.width = canvas.height = 0; canvas.remove(); delete el.dataset.fxState;
  };
}
