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
import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { site } from "@/config/site";

/**
 * 首页分享图：路径先占好，ui师 出图后放到 public/og/home.png（1200×630）即可自动生效。
 * 文件不存在时不输出 og:image，避免分享卡片出现破图。
 */
const HOME_OG_IMAGE = "/og/home.png";
const hasOgImage = existsSync(path.join(process.cwd(), "public", HOME_OG_IMAGE));
const ogImages = hasOgImage ? [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: `${site.name} · ${site.description}` }] : undefined;
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: site.seo.title, description: site.description, siteName: site.name, locale: "zh_CN", images: ogImages },
  twitter: { card: hasOgImage ? "summary_large_image" : "summary", title: site.seo.title, description: site.description, images: hasOgImage ? [HOME_OG_IMAGE] : undefined },
};

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