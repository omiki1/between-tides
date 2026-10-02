/* eslint-disable @next/next/no-img-element -- Steam CDN */
import Link from "next/link";
import { steam } from "@/config/steam";

const COVER =
  "https://cdn.cloudflare.steamstatic.com/steam/apps/1384160/library_600x900.jpg";

export function GamesPreview() {
  const count = steam.featured.length;
  return (
    <article className="widget-card games-preview">
      <div className="widget-head">
        <span className="eyebrow">在玩</span>
        <Link href="/about/#steam" className="text-link">
          {count} 款
        </Link>
      </div>
      <Link href="/about/#steam" className="games-preview-hero" aria-label="查看游戏角落">
        <img
          src={COVER}
          alt=""
          width={200}
          height={300}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <span className="games-preview-caption">
          <b>GUILTY GEAR STRIVE</b>
          <small>游戏角落 · Steam</small>
        </span>
      </Link>
      <ul className="games-preview-names">
        {steam.featured.slice(0, 4).map((game) => (
          <li key={game.appId}>{game.name}</li>
        ))}
      </ul>
    </article>
  );
}
