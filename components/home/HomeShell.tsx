import { ProfileCard } from "./ProfileCard";
import { QuoteCard } from "./QuoteCard";
import { CalendarCard } from "./CalendarCard";
import { CategoryWidget } from "./CategoryWidget";
import { SiteStats } from "./SiteStats";
import { AnimePreview } from "./AnimePreview";
import { GamesPreview } from "./GamesPreview";
import { TimeGreeting } from "./TimeGreeting";
import { ReactionTest } from "./ReactionTest";
import { LiveWallpaper } from "./LiveWallpaper";

export function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="home-layout site-grid">
      <aside className="home-sidebar" aria-label="左侧栏">
        <ProfileCard />
        <LiveWallpaper />
        <ReactionTest />
        <QuoteCard />
        <CategoryWidget />
      </aside>
      <div className="home-main">{children}</div>
      <aside className="home-sidebar home-sidebar-right" aria-label="右侧栏">
        <TimeGreeting />
        <SiteStats />
        <GamesPreview />
        <AnimePreview />
        <CalendarCard />
      </aside>
    </div>
  );
}
