/* 站名沙砾 / 玻璃卡片的开关。
 * - 构建默认值：NEXT_PUBLIC_FX（空格或逗号分隔），未设置时为 DEFAULT_FX；设成 "none" 全关。
 * - 运行时覆盖：?fx=glass（写入 localStorage，便于演示）；?fx=default 清除覆盖；?fx=none 全关。
 * - prefers-reduced-motion 或站内「减弱动效」开启时，所有动效一律不加载。 */
export type FxName = "wordmark" | "glass";
export const ALL_FX: FxName[] = ["wordmark", "glass"];
const DEFAULT_FX = "wordmark glass";
const KEY = "fx-override.v1";

function parse(value: string | null | undefined): FxName[] {
  if (!value || value === "none") return [];
  return value.split(/[\s,]+/).filter((v): v is FxName => (ALL_FX as string[]).includes(v));
}

/** 构建期默认（静态导出时内联进 JS） */
export function buildFx(): FxName[] {
  return parse(process.env.NEXT_PUBLIC_FX ?? DEFAULT_FX);
}

export function buildHas(name: FxName) {
  return buildFx().includes(name);
}

/** 浏览器里最终生效的开关 */
export function activeFx(): FxName[] {
  let override: string | null = null;
  try {
    const q = new URLSearchParams(location.search).get("fx");
    if (q === "default") localStorage.removeItem(KEY);
    else if (q !== null) localStorage.setItem(KEY, q);
    override = localStorage.getItem(KEY);
  } catch { /* 隐私模式等 */ }
  return override !== null ? parse(override) : buildFx();
}

export function motionReduced() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.ambianceMotion === "reduce";
}
