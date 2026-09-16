import { Hero } from "@/components/home/Hero";
import { NowPanel } from "@/components/home/NowPanel";
import { LatestPosts } from "@/components/home/LatestPosts";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { FeaturedArtwork } from "@/components/home/FeaturedArtwork";
import { NotesPreview } from "@/components/home/NotesPreview";
import { HomeShell } from "@/components/home/HomeShell";
import { HomeIntro } from "@/components/effects/HomeIntro";

export default function Home() {
  return (
    <main id="main" className="container">
      <HomeIntro />
      <Hero />
      <div className="status-grid">
        <NowPanel />
        <div id="music-slot" />
      </div>
      <HomeShell>
        <FeaturedArtwork />
        <LatestPosts />
        <ProjectsPreview />
        <GalleryPreview />
        <NotesPreview />
      </HomeShell>
    </main>
  );
}
