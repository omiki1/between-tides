import landscapeImport from "./landscape-import.json";

export type AlbumGroup = "collection" | "landscape";
export type AlbumSlug =
  | "dream"
  | "tide"
  | "star"
  | "character"
  | "maple"
  | "harbor"
  | "snow-village"
  | "snow-field";

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
  { slug: "dream", title: "梦境", english: "DREAM", description: "星潮、泡沫与课桌边的午睡。", group: "collection" },
  { slug: "tide", title: "潮汐", english: "TIDE", description: "暮色与月下的潮汐。", group: "collection" },
  { slug: "star", title: "星夜", english: "STARLIT", description: "深蓝夜里的一页。", group: "collection" },
  { slug: "character", title: "角色", english: "CHARACTER", description: "达妮娅的公开宣传图，个人非商业展示。", group: "collection" },
  { slug: "maple", title: "枫桥", english: "MAPLE BRIDGE", description: "林间小路与秋色。", group: "landscape" },
  { slug: "harbor", title: "海港", english: "HARBOR", description: "沙滩、港口与远处的船。", group: "landscape" },
  { slug: "snow-village", title: "雪乡", english: "SNOW VILLAGE", description: "雪山、星空与村落。", group: "landscape" },
  { slug: "snow-field", title: "雪地", english: "SNOW FIELD", description: "雾凇、雪湖与白林。", group: "landscape" },
];

const collectionPhotos: Photo[] = [
  landscapeImport.celebration as Photo,
  { id: "dream-tide", src: "/artwork/dream-tide.webp", title: "星潮入梦", english: "DREAMING WITH THE TIDE", location: "Between Tides · AI 共创", date: "2026.09.15", width: 1536, height: 1024, album: "dream" },
  { id: "classroom-dream", src: "/assets/denia/gallery/classroom-dream.webp", title: "课桌边的午睡", english: "CLASSROOM DREAM", location: "Between Tides · 本地生成灵感图", date: "2026.09.15", width: 1280, height: 720, album: "dream" },
  { id: "stagecraft", src: "/assets/denia/gallery/stagecraft.webp", title: "舞台构形", english: "STAGECRAFT", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1080, height: 1920, album: "character" },
  { id: "curtain-call", src: "/assets/denia/gallery/curtain-call.webp", title: "落幕之前", english: "CURTAIN CALL", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1600, height: 900, album: "character" },
  { id: "name-of-someone", src: "/assets/denia/gallery/name-of-someone.webp", title: "一个人的名字", english: "WHAT IS A NAME FOR", location: "Kuro Games 公开宣传图 · 个人非商业展示", date: "2026.09.15", width: 1600, height: 900, album: "character" },
  { id: "bubble-dream", src: "/gallery/bubble-dream.webp", title: "泡沫梦境", english: "BUBBLE DREAM", location: "Between Tides", date: "2026.09.15", width: 1506, height: 847, album: "dream" },
  { id: "iridescent-tide", src: "/gallery/iridescent-tide.webp", title: "虹彩潮汐", english: "IRIDESCENT TIDE", location: "Between Tides", date: "2026.09.12", width: 1149, height: 646, album: "dream" },
  { id: "moonlit-shadow", src: "/gallery/moonlit-shadow.webp", title: "月下微光", english: "MOONLIT SHADOW", location: "Between Tides", date: "2026.08.30", width: 1084, height: 609, album: "tide" },
  { id: "echoes-at-dusk", src: "/gallery/echoes-at-dusk.webp", title: "暮色回声", english: "ECHOES AT DUSK", location: "Between Tides", date: "2026.08.02", width: 1296, height: 729, album: "tide" },
  { id: "deep-tide", src: "/gallery/deep-tide.webp", title: "深蓝潮汐", english: "DEEP TIDE", location: "Between Tides", date: "2026.06.18", width: 1088, height: 612, album: "star" },
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
