import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { albums, albumsIn, getAlbum, photosIn } from "@/data/gallery";
import { GalleryBoard } from "@/components/gallery/GalleryBoard";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";

export function generateStaticParams() {
  return albums.map((album) => ({ album: album.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/gallery/[album]">): Promise<Metadata> {
  const { album: slug } = await params;
  const album = getAlbum(slug);
  if (!album) return { title: "没有找到这个相册" };
  const count = photosIn(album.slug).length;
  return {
    title: `相册 · ${album.title}`,
    description: `${album.description} 共 ${count} 张。`,
    alternates: { canonical: `/gallery/${album.slug}/` },
  };
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[album]">) {
  const { album: slug } = await params;
  const album = getAlbum(slug);
  if (!album) notFound();
  const photos = photosIn(album.slug);
  const siblings = albumsIn(album.group).filter((item) => item.slug !== album.slug);
  return (
    <main id="main" className="container inner">
      <Reveal className="page-head">
        <Link className="back-link" href="/gallery/"><ArrowLeft size={15}/>所有相册</Link>
        <span className="page-eyebrow" style={{ marginTop: "22px" }}><i/>{album.english} / {album.title}</span>
        <h1>{album.title}<span>，{photos.length} 张</span></h1>
        <p>{album.description}</p>
      </Reveal>
      {siblings.length > 0 && (
        <div className="tag-row album-siblings">
          {siblings.map((item) => (
            <Link key={item.slug} className="tag-chip" href={`/gallery/${item.slug}/`}>{item.title} <span>{photosIn(item.slug).length}</span></Link>
          ))}
        </div>
      )}
      <Reveal as="section" className="home-section">
        <GalleryBoard photos={photos}/>
      </Reveal>
      <details className="album-credits">
        <summary>图片来源</summary>
        <p>{album.slug === "character"
          ? "本相册含 Kuro Games 公开宣传图，版权归原作者所有，用于个人非商业展示。"
          : album.group === "landscape"
            ? "风景壁纸由站主提供，来自桌面收藏。"
            : "本相册含站主收藏、本站 AI 共创或本地生成图。"}</p>
      </details>
      <SideRail current="gallery"/>
    </main>
  );
}
