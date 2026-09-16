import Image from "next/image";
import Link from "next/link";
import { albumsIn, photosIn, type AlbumGroup } from "@/data/gallery";

export function AlbumGrid({ group, compact = false }: { group: AlbumGroup; compact?: boolean }) {
  const list = albumsIn(group);
  return (
    <div className={`album-modules ${compact ? "album-modules-compact" : ""}`}>
      {list.map((album) => {
        const photos = photosIn(album.slug);
        const cover = photos[0];
        return (
          <Link key={album.slug} href={`/gallery/${album.slug}/`} className="album-card" aria-label={`${album.title}，${photos.length} 张`}>
            <span className="album-card-cover">
              {cover && (
                <Image
                  src={cover.src}
                  alt=""
                  fill
                  sizes="(max-width:700px) 46vw, 280px"
                  className={cover.height > cover.width ? "portrait-cover" : undefined}
                />
              )}
            </span>
            <span className="album-card-body">
              <small>{album.english}</small>
              <h3>{album.title}</h3>
              <p>{photos.length} 张</p>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
