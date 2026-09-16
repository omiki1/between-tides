import type { Metadata } from "next";
import { Tv, Star, Database } from "lucide-react";
import { getBangumi, getBangumiStats } from "@/lib/bangumi";
import { AnimeBoard } from "@/components/anime/AnimeBoard";
import { ProfileCard } from "@/components/home/ProfileCard";
import { QuoteCard } from "@/components/home/QuoteCard";
import { CalendarCard } from "@/components/home/CalendarCard";
import { SiteStats } from "@/components/home/SiteStats";
import { TimeGreeting } from "@/components/home/TimeGreeting";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "追番",
  description: "从哔哩哔哩同步过来的追番列表：正在看的、看过的，以及还想再打开的那些。",
  alternates: { canonical: "/anime/" },
};

export default function AnimePage() {
  const items = getBangumi();
  const stats = getBangumiStats();
  return (
    <main id="main" className="container inner anime-page">
      <div className="anime-shell">
        <aside className="home-sidebar" aria-label="资料">
          <ProfileCard />
          <QuoteCard />
        </aside>
        <div className="anime-center">
          <Reveal className="anime-heading">
            <h1><Tv size={22} /> 追番</h1>
            <p>
              我的追番列表，数据来自哔哩哔哩空间 <a href={stats.space} target="_blank" rel="noreferrer">A1478L</a>
              。数据更新于 {stats.fetchedAt.replaceAll("-", ".")}。
            </p>
          </Reveal>
          <div className="anime-stat-cards">
            <article>
              <Tv size={18} />
              <span>总追番</span>
              <b>{stats.total}</b>
            </article>
            <article>
              <Star size={18} />
              <span>Bilibili 均分</span>
              <b>{stats.average}</b>
            </article>
            <article>
              <span>在看</span>
              <b>{stats.watching}</b>
            </article>
            <article>
              <Database size={18} />
              <span>数据来源</span>
              <b>Bilibili</b>
            </article>
          </div>
          <AnimeBoard items={items} />
        </div>
        <aside className="home-sidebar" aria-label="站点">
          <TimeGreeting />
          <SiteStats />
          <CalendarCard />
        </aside>
      </div>
    </main>
  );
}
