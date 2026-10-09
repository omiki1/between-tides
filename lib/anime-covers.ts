import { existsSync } from "node:fs";
import path from "node:path";
import type { BangumiItem } from "@/lib/bangumi";

/** 仅服务端：给追番条目补上站内封面路径（scripts/make-anime-covers.mjs 生成；没有就保持 B 站地址）。 */
export function withLocalCovers(items: BangumiItem[]): BangumiItem[] {
  return items.map((item) => {
    if (!/hdslb\.com\//.test(item.cover)) return item;
    const name = path.basename(new URL(item.cover).pathname).replace(/\.\w+$/, "");
    const base = `/anime-covers/${name}`;
    const ok = existsSync(path.join(process.cwd(), "public", `${base}.w220.webp`)) && existsSync(path.join(process.cwd(), "public", `${base}.w440.webp`));
    return ok ? { ...item, coverLocal: base } : item;
  });
}
