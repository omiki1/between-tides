/* eslint-disable @next/next/no-img-element -- Steam CDN */
import { steam } from "@/config/steam";

const COVER =
  "https://cdn.cloudflare.steamstatic.com/steam/apps/1384160/library_600x900.jpg";

export function GamesPreview() {
  const count = steam.featured.length;
  return (
    <article className="widget-card games-preview">
      <div className="widget-head">
        <span className="eyebrow">在玩</span>
        <a href={steam.profileUrl} className="text-link" target="_blank" rel="me noreferrer">
          {count} 款
        </a>
      </div>
      <a href={steam.profileUrl} className="games-preview-hero" aria-label="打开 Steam 主页" target="_blank" rel="me noreferrer">
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
          <small>Steam</small>
        </span>
      </a>
      <ul className="games-preview-names">
        {steam.featured.slice(0, 4).map((game) => (
          <li key={game.appId}>{game.name}</li>
        ))}
      </ul>
    </article>
  );
}
