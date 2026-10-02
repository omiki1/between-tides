/* eslint-disable @next/next/no-img-element -- Steam CDN art */
import { ExternalLink, Gamepad2, Star } from "lucide-react";
import { steam, type SteamGame } from "@/config/steam";

function hoursLabel(hours?: number) {
  if (hours == null || hours <= 0) return "常玩";
  if (hours >= 10) return `${hours.toFixed(hours % 1 ? 1 : 0)} h`;
  return `${hours.toFixed(1)} h`;
}

function GameTile({ game }: { game: SteamGame }) {
  return (
    <li>
      <a href={game.storeUrl} target="_blank" rel="noreferrer" title={game.name}>
        <img
          src={game.cover}
          alt=""
          width={120}
          height={180}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <span className="steam-game-title">{game.name}</span>
        <span className="steam-game-hours">{hoursLabel(game.hours)}</span>
      </a>
    </li>
  );
}

export function SteamCard() {
  return (
    <article className="steam-card glass-panel" aria-labelledby="steam-card-title">
      <header className="steam-card-head">
        <div className="steam-card-identity">
          <img
            className="steam-avatar"
            src={steam.avatar}
            alt={`${steam.displayName} 的 Steam 头像`}
            width={64}
            height={64}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="steam-card-meta">
            <span className="eyebrow">
              <Gamepad2 size={13} aria-hidden /> STEAM
            </span>
            <h3 id="steam-card-title">{steam.displayName}</h3>
            <p className="steam-card-sub">
              Lv.{steam.level} · {steam.gameCount} 款游戏 · 加入于 {steam.memberSince}
            </p>
          </div>
        </div>
        <a
          className="steam-profile-link"
          href={steam.profileUrl}
          target="_blank"
          rel="me noopener noreferrer"
        >
          打开主页 <ExternalLink size={14} aria-hidden />
        </a>
      </header>

      <div className="steam-fav">
        <Star size={14} aria-hidden />
        <span>最爱</span>
        <b>{steam.favoriteGame.name}</b>
        <small>{hoursLabel(steam.favoriteGame.hours)}</small>
      </div>

      <div className="steam-featured">
        <span className="steam-featured-label">常玩 / 最近</span>
        <ul className="steam-game-grid">
          {steam.featured.map((game) => (
            <GameTile key={game.appId} game={game} />
          ))}
        </ul>
      </div>
    </article>
  );
}
