export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  mid?: string;
  url?: string;
  duration?: number;
  requiresSubscription?: boolean;
};

export function qqOutchainPlayerUrl(songId: string) {
  if (!/^\d+$/.test(songId)) return "";
  const url = new URL("https://i.y.qq.com/n2/m/outchain/player/index.html");
  url.searchParams.set("songid", songId);
  url.searchParams.set("songtype", "0");
  return url.href;
}
