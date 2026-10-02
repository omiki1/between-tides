import landscapeImport from "./landscape-import.json";

export type AlbumGroup = "collection" | "landscape";
export type AlbumSlug =
  | "anime"
  | "character"
  | "scenery";

export type Photo = {
  id: string;
  src: string;
  title: string;
  english: string;
  location: string;
  date: string;
  width: number;
  height: number;
  album: AlbumSlug;
};

export type Album = {
  slug: AlbumSlug;
  title: string;
  english: string;
  description: string;
  group: AlbumGroup;
};

/** 站主提供的收藏、本站 AI 共创画面，以及达妮娅公开宣传图的裁切；具体来源记录于 docs/ASSET_SOURCES.md。 */
export const albums: Album[] = [
  { slug: "anime", title: "Anime", english: "ANIME", description: "梦境、潮汐与星夜的插画合集。", group: "collection" },
  { slug: "character", title: "角色", english: "CHARACTER", description: "达妮娅的公开宣传图，个人非商业展示。", group: "collection" },
  { slug: "scenery", title: "风景", english: "SCENERY", description: "枫桥、海港、雪乡与雪地的风景壁纸。", group: "landscape" },
];

const collectionPhotos: Photo[] = [
  landscapeImport.celebration as Photo,
  { id: "dream-tide", src: "/artwork/dream-tide.webp", title: "星潮入梦", english: "DREAMING WITH THE TIDE", location: "幻想收束点 · AI 共创", date: "2026.09.15", width: 1536, height: 1024, album: "anime" },
  { id: "classroom-dream", src: "/assets/denia/gallery/classroom-dream.webp", title: "课桌边的午睡", english: "CLASSROOM DREAM", location: "幻想收束点 · 本地生成灵感图", date: "2026.09.15", width: 1280, height: 720, album: "anime" },
  { id: "stagecraft", src: "/assets/denia/gallery/stagecraft.webp", title: "舞台构形", english: "STAGECRAFT", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1080, height: 1920, album: "character" },
  { id: "curtain-call", src: "/assets/denia/gallery/curtain-call.webp", title: "落幕之前", english: "CURTAIN CALL", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1600, height: 900, album: "character" },
  { id: "name-of-someone", src: "/assets/denia/gallery/name-of-someone.webp", title: "一个人的名字", english: "WHAT IS A NAME FOR", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1600, height: 900, album: "character" },
  { id: "bubble-dream", src: "/gallery/bubble-dream.webp", title: "泡沫梦境", english: "BUBBLE DREAM", location: "幻想收束点", date: "2026.09.15", width: 1506, height: 847, album: "anime" },
  { id: "iridescent-tide", src: "/gallery/iridescent-tide.webp", title: "虹彩潮汐", english: "IRIDESCENT TIDE", location: "幻想收束点", date: "2026.09.12", width: 1149, height: 646, album: "anime" },
  { id: "moonlit-shadow", src: "/gallery/moonlit-shadow.webp", title: "月下微光", english: "MOONLIT SHADOW", location: "幻想收束点", date: "2026.08.30", width: 1084, height: 609, album: "anime" },
  { id: "echoes-at-dusk", src: "/gallery/echoes-at-dusk.webp", title: "暮色回声", english: "ECHOES AT DUSK", location: "幻想收束点", date: "2026.08.02", width: 1296, height: 729, album: "anime" },
  { id: "deep-tide", src: "/gallery/deep-tide.webp", title: "深蓝潮汐", english: "DEEP TIDE", location: "幻想收束点", date: "2026.06.18", width: 1088, height: 612, album: "anime" },
];

export const gallery: Photo[] = [...collectionPhotos, ...(landscapeImport.landscapes as Photo[])];

export function getAlbum(slug: string) {
  return albums.find((album) => album.slug === slug);
}

export function photosIn(slug: AlbumSlug) {
  return gallery.filter((photo) => photo.album === slug);
}

export function albumCover(slug: AlbumSlug) {
  return photosIn(slug)[0];
}

export function albumsIn(group: AlbumGroup) {
  return albums.filter((album) => album.group === group);
}

export const featuredArtwork = landscapeImport.celebration as Photo;
