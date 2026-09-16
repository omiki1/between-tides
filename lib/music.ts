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

type QqVkeyResponse = {
  req_0?: {
    data?: {
      sip?: string[];
      midurlinfo?: Array<{ purl?: string }>;
    };
  };
};

const PLAY_URL_TTL_MS = 8 * 60 * 1000;
const playUrlCache = new Map<string, { url: string; expires: number }>();

/** Official outchain widget. Only `songid` and `songtype` are read; there is no autoplay query. */
export function qqOutchainPlayerUrl(songId: string) {
  if (!/^\d+$/.test(songId)) return "";
  const url = new URL("https://i.y.qq.com/n2/m/outchain/player/index.html");
  url.searchParams.set("songid", songId);
  url.searchParams.set("songtype", "0");
  return url.href;
}

function playUrlFromVkey(payload: QqVkeyResponse) {
  const data = payload.req_0?.data;
  const purl = data?.midurlinfo?.[0]?.purl;
  const sip = data?.sip?.find(Boolean);
  if (!purl || !sip) return "";
  return `${sip}${purl}`.replace(/^http:\/\//i, "https://");
}

export function forgetQqPlayUrl(mid: string) {
  playUrlCache.delete(mid);
}

/** 用 QQ 公开 vkey JSONP 取试听地址，不落地文件、不经本站代理。 */
export function resolveQqPlayUrl(mid: string): Promise<string> {
  if (!mid || typeof window === "undefined") return Promise.resolve("");
  const cached = playUrlCache.get(mid);
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.url);

  const guid = String(Math.floor(1e9 + Math.random() * 9e9));
  const callback = `qqvkey_${guid}`;
  const request = {
    req_0: {
      module: "vkey.GetVkeyServer",
      method: "CgiGetVkey",
      param: { guid, songmid: [mid], songtype: [0], uin: "0", loginflag: 0, platform: "20" },
    },
  };
  const url = new URL("https://u.y.qq.com/cgi-bin/musicu.fcg");
  url.searchParams.set("callback", callback);
  url.searchParams.set("format", "jsonp");
  url.searchParams.set("data", JSON.stringify(request));

  return new Promise((resolve) => {
    const script = document.createElement("script");
    const host = window as unknown as Record<string, ((payload: QqVkeyResponse) => void) | undefined>;
    let settled = false;
    const finish = (playUrl = "") => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      delete host[callback];
      script.remove();
      if (playUrl) playUrlCache.set(mid, { url: playUrl, expires: Date.now() + PLAY_URL_TTL_MS });
      resolve(playUrl);
    };
    const timer = window.setTimeout(() => finish(""), 8000);
    host[callback] = (payload) => finish(playUrlFromVkey(payload));
    script.src = url.href;
    script.async = true;
    script.onerror = () => finish("");
    document.head.appendChild(script);
  });
}
