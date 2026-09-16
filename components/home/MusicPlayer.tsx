"use client";
/* eslint-disable @next/next/no-img-element -- album art comes from QQ Music's public image CDN. */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, AudioLines, ListMusic, X, ExternalLink } from "lucide-react";
import { site } from "@/config/site";
import snapshot from "@/data/qq-playlist.json";
import { forgetQqPlayUrl, qqOutchainPlayerUrl, resolveQqPlayUrl, type MusicTrack } from "@/lib/music";

const AUTOPLAY_KEY = "between-tides.music-autoplay.v1";
const autoplayListeners = new Set<() => void>();
const qqTracks: MusicTrack[] = snapshot.songs;
const preferredStart = qqTracks.find(track => track.mid === "002Cw13q3FDGIH" && !track.requiresSubscription);
const initialTrack = preferredStart || qqTracks.find(track => !track.requiresSubscription) || qqTracks[0]!;
const localTracks: MusicTrack[] = site.music.map((track, index) => ({ ...track, id: `local-${index}` }));
const time = (value: number) => { const seconds = Number.isFinite(value) ? value : 0; return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`; };

function readAutoplay() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    const stored = window.localStorage.getItem(AUTOPLAY_KEY);
    if (stored === "0") return false;
    if (stored === "1") return true;
  } catch { /* private mode */ }
  return Boolean(site.musicAutoplay) && !reduced;
}

function subscribeAutoplay(onStoreChange: () => void) {
  autoplayListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    autoplayListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeAutoplay(value: boolean) {
  try { window.localStorage.setItem(AUTOPLAY_KEY, value ? "1" : "0"); } catch { /* private mode */ }
  autoplayListeners.forEach((listener) => listener());
}

function introIsPlaying() {
  const value = document.documentElement.dataset.intro;
  return value === "boot" || value === "leaving";
}

function waitForIntro(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted || !introIsPlaying()) { resolve(); return; }
    const done = () => {
      if (!signal.aborted && introIsPlaying()) return;
      observer.disconnect();
      signal.removeEventListener("abort", done);
      resolve();
    };
    const observer = new MutationObserver(done);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
    signal.addEventListener("abort", done);
  });
}

function waitForGesture(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) { resolve(); return; }
    const done = () => {
      window.removeEventListener("pointerdown", done, true);
      window.removeEventListener("keydown", done, true);
      signal.removeEventListener("abort", done);
      resolve();
    };
    window.addEventListener("pointerdown", done, { capture: true, once: true });
    window.addEventListener("keydown", done, { capture: true, once: true });
    signal.addEventListener("abort", done);
  });
}

export function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const revision = useRef(0), volume = useRef(.45), currentRef = useRef(initialTrack);
  const autoplay = useSyncExternalStore(subscribeAutoplay, readAutoplay, () => Boolean(site.musicAutoplay));
  const [source, setSource] = useState<"qq" | "local">("qq");
  const [current, setCurrent] = useState<MusicTrack>(initialTrack);
  const [playerEpoch, setPlayerEpoch] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [widgetFallback, setWidgetFallback] = useState(false);
  const [position, setPosition] = useState(0), [duration, setDuration] = useState(0), [error, setError] = useState("");
  const queue = source === "qq" ? qqTracks : localTracks;
  const qqPlayer = current.mid ? qqOutchainPlayerUrl(current.id) : "";
  const showWidget = Boolean(qqPlayer && widgetFallback);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    const element = audio.current;
    const stop = (event: Event) => {
      if ((event as CustomEvent).detail !== "music") {
        revision.current += 1;
        element?.pause();
      }
    };
    element?.setAttribute("referrerpolicy", "no-referrer");
    window.addEventListener("site-audio", stop);
    return () => { revision.current += 1; element?.pause(); window.removeEventListener("site-audio", stop); };
  }, []);

  function pause() { revision.current++; audio.current?.pause(); setNeedsGesture(false); }

  async function playTrack(track: MusicTrack = currentRef.current, ticket = ++revision.current) {
    const element = audio.current;
    if (!element || ticket !== revision.current) return false;
    const same = track.id === currentRef.current.id && element.hasAttribute("src") && !element.error;
    setCurrent(track); setSource(track.mid ? "qq" : "local"); setError(""); setNeedsGesture(false); setWidgetFallback(false);
    window.dispatchEvent(new CustomEvent("site-audio", { detail: "music" }));
    try {
      if (!same) {
        let src = track.src;
        if (!src && track.mid) src = await resolveQqPlayUrl(track.mid);
        if (ticket !== revision.current) return false;
        if (!src) {
          if (track.mid) { setWidgetFallback(true); setError("这首歌暂时无法试听，可点封面用官方播放器。"); }
          else setError("这段环境音暂时无法播放，请切换曲目。");
          return false;
        }
        element.src = src; element.volume = volume.current;
        setPosition(0); setDuration(0);
      }
      await element.play();
      return ticket === revision.current;
    } catch (cause) {
      if (ticket !== revision.current) return false;
      if (cause instanceof DOMException && cause.name === "NotAllowedError") {
        setNeedsGesture(true);
        return false;
      }
      if (track.mid) { setWidgetFallback(true); setError("这首歌暂时无法试听，可点封面用官方播放器。"); }
      else setError("这段环境音暂时无法播放，请切换曲目。");
      return false;
    }
  }

  useEffect(() => {
    if (!autoplay) {
      revision.current += 1;
      audio.current?.pause();
      return;
    }
    const ticket = ++revision.current;
    const stop = new AbortController();
    void (async () => {
      await waitForIntro(stop.signal);
      if (stop.signal.aborted || ticket !== revision.current) return;
      const track = currentRef.current.mid ? currentRef.current : initialTrack;
      const started = await playTrack(track, ticket);
      if (started || stop.signal.aborted || ticket !== revision.current) return;
      setNeedsGesture(true);
      await waitForGesture(stop.signal);
      if (stop.signal.aborted || ticket !== revision.current) return;
      await playTrack(track, ticket);
    })();
    return () => stop.abort();
  }, [autoplay]);

  function selectTrack(track: MusicTrack) {
    dialog.current?.close();
    void playTrack(track);
  }

  function change(direction: number) {
    const list = current.mid ? qqTracks : localTracks;
    if (!list.length) return;
    const next = (Math.max(list.findIndex(track => track.id === current.id), 0) + direction + list.length) % list.length;
    void playTrack(list[next]);
  }

  function toggleAutoplay() {
    const next = !autoplay;
    writeAutoplay(next);
    if (!next) {
      pause();
      setPlayerEpoch(value => value + 1);
    }
  }

  const status = error || (showWidget
    ? <>播放器由 QQ 音乐提供 · <a href={current.url} target="_blank" rel="noreferrer">打开歌曲 ↗</a></>
    : current.mid
      ? needsGesture
        ? "浏览器拦截了自动播放，点一下页面开始导入的歌单"
        : <>试听流来自 QQ 音乐 · <a href={current.url} target="_blank" rel="noreferrer">打开歌曲 ↗</a></>
      : "");

  return <section className="music-panel" aria-label="音乐播放器">
    <div className="music-top"><span className="eyebrow"><AudioLines size={13}/> MUSIC</span><div className="music-tools"><button className="autoplay-toggle" type="button" aria-pressed={autoplay} aria-label="进入页面时播放导入的 QQ 音乐" onClick={toggleAutoplay}>{autoplay ? "进页播放开" : "进页播放关"}</button><button className="playlist-trigger" onClick={() => dialog.current?.showModal()} aria-label="打开歌单列表"><ListMusic size={15}/><span>歌单 · {queue.length}</span></button></div></div>
    {showWidget ? <div className="qq-player-wrap">
      <iframe key={`${current.id}-${playerEpoch}`} src={qqPlayer} title={`QQ 音乐播放器：${current.title}`} width="100%" height="65" frameBorder="0" allow="autoplay; encrypted-media" loading={autoplay ? "eager" : "lazy"} referrerPolicy="strict-origin-when-cross-origin"/>
    </div> : <>
      <div className="music-main"><div className="album-cover"><img src={current.cover} alt="专辑封面" width={64} height={64}/><span/></div><div className="track-info"><h3 title={current.title}>{current.title}</h3><p>{current.artist}</p><div className="music-controls">
        <button aria-label="上一首" onClick={() => change(-1)}><SkipBack size={15}/></button>
        <button className="play-button" aria-label={playing ? "暂停" : "播放"} onClick={() => playing ? pause() : void playTrack()}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
        <button aria-label="下一首" onClick={() => change(1)}><SkipForward size={15}/></button>
        <label className="volume"><Volume2 size={13}/><input aria-label="音量" type="range" min="0" max="1" step=".01" defaultValue=".45" onChange={event => { volume.current = Number(event.target.value); if (audio.current) audio.current.volume = volume.current; }}/></label>
      </div></div></div>
      <div className="track-progress"><span>{time(position)}</span><input aria-label="播放进度" type="range" min="0" max={duration || 1} step=".1" value={Math.min(position, duration || 1)} disabled={!duration} onChange={event => { if (audio.current) audio.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); }}/><span>{time(duration || current.duration || 0)}</span></div>
    </>}
    <p className="music-status" role="status">{status}</p>
    <audio ref={audio} preload="none" onLoadedMetadata={() => { const value = audio.current?.duration; setDuration(value && Number.isFinite(value) ? value : 0); }} onPlay={() => { setPlaying(true); setError(""); setNeedsGesture(false); }} onPause={() => setPlaying(false)} onTimeUpdate={() => setPosition(audio.current?.currentTime || 0)} onEnded={() => change(1)} onError={() => { setPlaying(false); if (current.mid) { forgetQqPlayUrl(current.mid); setWidgetFallback(true); setError("这首歌暂时无法试听，可点封面用官方播放器。"); } else setError("这段环境音暂时无法播放，请切换曲目。"); }}/>
    <dialog ref={dialog} className="playlist-dialog" aria-labelledby="playlist-heading" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header className="playlist-header"><div><span className="eyebrow">MY MUSIC</span><h2 id="playlist-heading">我的歌单</h2></div><button className="icon-button" aria-label="关闭歌单" onClick={() => dialog.current?.close()}><X size={20}/></button></header>
      <div className="playlist-tabs" role="group" aria-label="歌单来源"><button aria-pressed={source === "qq"} onClick={() => setSource("qq")}>QQ 音乐 <small>{qqTracks.length}</small></button><button aria-pressed={source === "local"} onClick={() => setSource("local")}>环境音 <small>{localTracks.length}</small></button></div>
      {source === "qq" && <div className="playlist-info"><p>{snapshot.title}</p><div><a href={snapshot.url} target="_blank" rel="noreferrer">打开原歌单 <ExternalLink size={12}/></a></div></div>}
      <ol className="playlist-tracks">{queue.map((track, index) => <li key={track.id} className={track.id === current.id ? "current-track" : ""}>
        <button className="playlist-song" onClick={() => selectTrack(track)} aria-label={`播放 ${track.title}，${track.artist}`}><span className="song-number">{track.id === current.id ? <AudioLines size={15}/> : String(index + 1).padStart(2, "0")}</span><img src={track.cover} alt="" width={40} height={40} loading="lazy"/><span className="song-description"><b>{track.title}</b><small>{track.artist}</small></span><span className="song-length">{track.requiresSubscription ? "VIP" : time(track.duration || 0)}</span></button>
        {track.url && <a className="song-external" href={track.url} target="_blank" rel="noreferrer" aria-label={`在 QQ 音乐打开 ${track.title}`}><ExternalLink size={14}/></a>}
      </li>)}</ol>
      <footer className="playlist-footer"><p role="status">{source === "qq" ? "选择歌曲后播放 QQ 试听流；无法试听时会改用官方外链播放器。" : "本站原创环境音。"}</p>{error && <p role="status">{error}</p>}</footer>
    </dialog>
  </section>;
}
