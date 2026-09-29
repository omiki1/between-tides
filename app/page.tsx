import { Hero } from "@/components/home/Hero";
import { NowPanel } from "@/components/home/NowPanel";
import { LatestPosts } from "@/components/home/LatestPosts";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { FeaturedArtwork } from "@/components/home/FeaturedArtwork";
import { NotesPreview } from "@/components/home/NotesPreview";
import { GuestbookWall } from "@/components/home/GuestbookWall";
import { FriendsPreview } from "@/components/home/FriendsPreview";
import { SakuraPick } from "@/components/home/SakuraPick";
import { HomeShell } from "@/components/home/HomeShell";
import { HomeIntro } from "@/components/effects/HomeIntro";
import { TideDivider } from "@/components/effects/TideDivider";
import { Reveal } from "@/components/effects/Reveal";

export default function Home() {
  return (
    <main id="main" className="container">
      <HomeIntro />
      <Hero />
      <Reveal delay={0.05}>
        <div className="status-grid">
          <NowPanel />
          <div id="music-slot" />
        </div>
      </Reveal>
      <TideDivider palette="aurora" />
      <HomeShell>
        <Reveal delay={0.03}>
          <SakuraPick />
        </Reveal>
        <Reveal delay={0.04}>
          <FeaturedArtwork />
        </Reveal>
        <Reveal delay={0.08}>
          <LatestPosts />
        </Reveal>
        <Reveal delay={0.12}>
          <ProjectsPreview />
        </Reveal>
        <Reveal delay={0.16}>
          <GalleryPreview />
        </Reveal>
        <Reveal delay={0.2}>
          <NotesPreview />
        </Reveal>
      </HomeShell>
      <TideDivider palette="dusk" />
      <Reveal delay={0.06}>
        <GuestbookWall />
      </Reveal>
      <TideDivider palette="mist" />
      <Reveal delay={0.08}>
        <FriendsPreview />
      </Reveal>
      <TideDivider palette="aurora" />
    </main>
  );
}