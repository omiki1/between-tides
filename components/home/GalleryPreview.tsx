import { albums } from "@/data/gallery";
import { AlbumGrid } from "@/components/gallery/AlbumGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function GalleryPreview() {
  return (
    <section className="home-section">
      <SectionTitle number="03" title="相册" english="ALBUM" href="/gallery/" link={`查看 ${albums.length} 个相册`}/>
      <p className="album-group-label">收藏</p>
      <AlbumGrid group="collection" compact/>
      <p className="album-group-label">风景壁纸</p>
      <AlbumGrid group="landscape" compact/>
    </section>
  );
}
