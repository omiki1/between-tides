import { ProfileCard } from "./ProfileCard";
import { QuoteCard } from "./QuoteCard";
import { CalendarCard } from "./CalendarCard";
import { CategoryWidget } from "./CategoryWidget";
import { SiteStats } from "./SiteStats";
import { AnimePreview } from "./AnimePreview";
import { TimeGreeting } from "./TimeGreeting";

export function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="home-layout site-grid">
      <aside className="home-sidebar" aria-label="左侧栏">
        <ProfileCard />
        <QuoteCard />
        <CategoryWidget />
      </aside>
      <div className="home-main">{children}</div>
      <aside className="home-sidebar home-sidebar-right" aria-label="右侧栏">
        <TimeGreeting />
        <SiteStats />
        <AnimePreview />
        <CalendarCard />
      </aside>
    </div>
  );
}
