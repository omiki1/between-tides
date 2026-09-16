import Link from "next/link";
import { getBangumi, getBangumiStats } from "@/lib/bangumi";

export function AnimePreview() {
  const items = getBangumi().slice(0, 6);
  const stats = getBangumiStats();
  return (
    <article className="widget-card anime-preview">
      <div className="widget-head">
        <span className="eyebrow">正在追</span>
        <Link href="/anime/" className="text-link">
          {stats.total} 部
        </Link>
      </div>
      <ul className="anime-preview-grid">
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.link} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.cover} alt="" width={72} height={96} loading="lazy" referrerPolicy="no-referrer" />
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
