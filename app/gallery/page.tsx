import type { Metadata } from "next";
import { albums, gallery } from "@/data/gallery";
import { AlbumGrid } from "@/components/gallery/AlbumGrid";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = { title: "相册", description: "按相册翻看收藏的图片。", alternates: { canonical: "/gallery/" } };

export default function GalleryPage() {
  return (
    <main id="main" className="container inner">
      <Reveal className="page-head">
        <span className="page-eyebrow"><i/>ALBUM / 相册</span>
        <h1>相册</h1>
        <p>收藏与风景分成独立相册，点进去慢慢看。</p>
        <div className="page-stats">
          <span><b>{albums.length}</b> 个相册</span>
          <span><b>{gallery.length}</b> 张图片</span>
        </div>
      </Reveal>
      <Reveal as="section" className="home-section">
        <p className="album-group-label">收藏</p>
        <AlbumGrid group="collection"/>
        <p className="album-group-label">风景壁纸</p>
        <AlbumGrid group="landscape"/>
      </Reveal>
      <details className="album-credits">
        <summary>图片来源</summary>
        <p>梦境里有本站 AI 共创与本地生成图。角色相册来自 Kuro Games 公开宣传图，版权归原作者所有，用于个人非商业展示。潮汐、星夜与风景壁纸由站主提供。</p>
      </details>
      <SideRail current="gallery"/>
    </main>
  );
}
