"use client";
import { useEffect, useMemo, useState, startTransition } from "react";
import { Search, Star, X } from "lucide-react";
import { followLabels, type BangumiItem } from "@/lib/bangumi";
import { coverSrcSet, coverThumb } from "@/lib/cover-thumb";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE = 24;

export function AnimeBoard({ items }: { items: BangumiItem[] }) {
  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.seasonTypeName, (counts.get(item.seasonTypeName) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [items]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("全部");
  const [status, setStatus] = useState(0);
  const [sort, setSort] = useState<"rating-desc" | "rating-asc" | "title">("rating-desc");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<BangumiItem | null>(null);
  /* Cmd+K 里的追番结果会带 ?q=番名 跳过来，这里接住并预填搜索框。 */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) startTransition(() => { setQuery(q); setPage(1); });
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = items.filter((item) => {
      if (type !== "全部" && item.seasonTypeName !== type) return false;
      if (status && item.followStatus !== status) return false;
      if (needle && !item.title.toLowerCase().includes(needle)) return false;
      return true;
    });
    return [...next].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "zh");
      const delta = (b.rating || 0) - (a.rating || 0);
      return sort === "rating-desc" ? delta : -delta;
    });
  }, [items, query, type, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE, current * PAGE);

  function filterBy(next: { type?: string; status?: number }) {
    startTransition(() => {
      if (next.type !== undefined) setType(next.type);
      if (next.status !== undefined) setStatus(next.status);
      setPage(1);
    });
  }

  return (
    <div className="anime-board">
      <div className="anime-toolbar">
        <div className="anime-search-row">
          <label className="anime-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="搜索番剧..."
              aria-label="搜索追番"
            />
          </label>
          <label className="anime-sort">
            <span className="sr-only">排序</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setPage(1); }} aria-label="排序">
              <option value="rating-desc">评分最高</option>
              <option value="rating-asc">评分最低</option>
              <option value="title">名称</option>
            </select>
          </label>
        </div>
        <div className="anime-type-tabs" role="tablist" aria-label="类型">
          <button role="tab" aria-selected={type === "全部"} className={type === "全部" ? "active" : undefined} onClick={() => filterBy({ type: "全部" })}>
            全部 <b>{items.length}</b>
          </button>
          {types.map(([name, count]) => (
            <button key={name} role="tab" aria-selected={type === name} className={type === name ? "active" : undefined} onClick={() => filterBy({ type: name })}>
              {name} <b>{count}</b>
            </button>
          ))}
        </div>
        <div className="gallery-filter" role="group" aria-label="追番状态">
          {[0, 2, 3].map((value) => (
            <button key={value} className={status === value ? "active" : undefined} onClick={() => filterBy({ status: value })}>
              {value === 0 ? "全部状态" : followLabels[value]}
            </button>
          ))}
        </div>
      </div>

      <p className="gallery-note">
        共 {filtered.length} 部。封面来自哔哩哔哩公开追番列表，点击打开详情或跳转到原页面。
      </p>

      {!filtered.length && (
        <EmptyState line={query.trim() ? <>没找到「{query.trim()}」……是不是记错名字了？</> : "这一栏里还没有番呢。"}
          hint="换个关键词，或者把类型和状态放宽一点再看看。">
          <div className="ft-search-chips">
            <button type="button" onClick={() => { setQuery(""); filterBy({ type: "全部", status: 0 }); }}>清空筛选</button>
          </div>
        </EmptyState>
      )}
      <ul className="anime-grid">
        {slice.map((item) => (
          <li key={item.id} className="anime-card">
            <button type="button" onClick={() => setOpen(item)} aria-label={`查看 ${item.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverThumb(item.cover, 220, 293)} srcSet={coverSrcSet(item.cover, 220, 293)} alt="" width={220} height={293} loading="lazy" decoding="async" referrerPolicy="no-referrer" crossOrigin="anonymous" />
              {item.rating > 0 ? (
                <span className="anime-score">
                  <Star size={11} />
                  {item.rating.toFixed(1)}
                </span>
              ) : null}
              <span className="anime-type">{item.seasonTypeName}</span>
            </button>
            <h3>{item.title}</h3>
            <p>{item.epStatus || followLabels[item.followStatus]}</p>
          </li>
        ))}
      </ul>

      {pages > 1 ? (
        <nav className="anime-pages" aria-label="追番分页">
          <button disabled={current === 1} onClick={() => setPage(current - 1)}>
            上一页
          </button>
          <span>
            {current} / {pages}
          </span>
          <button disabled={current === pages} onClick={() => setPage(current + 1)}>
            下一页
          </button>
        </nav>
      ) : null}

      {open ? (
        <dialog className="anime-modal" open onClick={(event) => { if (event.target === event.currentTarget) setOpen(null); }}>
          <article>
            <button className="icon-button" aria-label="关闭" onClick={() => setOpen(null)}>
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverThumb(open.cover, 280, 373)} srcSet={coverSrcSet(open.cover, 280, 373)} alt="" width={280} height={373} decoding="async" referrerPolicy="no-referrer" />
            <div>
              <span className="eyebrow">{open.seasonTypeName} · {followLabels[open.followStatus]}</span>
              <h2>{open.title}</h2>
              {open.rating > 0 ? <p className="anime-modal-score">评分 {open.rating.toFixed(1)}</p> : null}
              <p>{open.evaluate || "暂无简介。"}</p>
              <p className="anime-modal-meta">{open.epStatus}{open.areas.length ? ` · ${open.areas.join(" / ")}` : ""}</p>
              <a className="button-primary" href={open.link} target="_blank" rel="noreferrer">
                在哔哩哔哩打开
              </a>
            </div>
          </article>
        </dialog>
      ) : null}
    </div>
  );
}
