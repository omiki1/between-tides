"use client";
/* eslint-disable @next/next/no-img-element -- album art comes from QQ Music's public image CDN. */
import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, AudioLines, ListMusic, X, ExternalLink } from "lucide-react";
import { site } from "@/config/site";
import snapshot from "@/data/qq-playlist.json";
import { qqOutchainPlayerUrl, type MusicTrack } from "@/lib/music";

const qqTracks: MusicTrack[] = snapshot.songs;
const initialTrack = qqTracks.find(track => !track.requiresSubscription) || qqTracks[0];
const localTracks: MusicTrack[] = site.music.map((track, index) => ({ ...track, id: `local-${index}` }));
const time = (value: number) => { const seconds = Number.isFinite(value) ? value : 0; return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`; };

export function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const revision = useRef(0), volume = useRef(.45);
  const [source, setSource] = useState<"qq" | "local">("qq");
  const [current, setCurrent] = useState<MusicTrack>(initialTrack);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0), [duration, setDuration] = useState(0), [error, setError] = useState("");
  const queue = source === "qq" ? qqTracks : localTracks;
  const qqPlayer = current.mid ? qqOutchainPlayerUrl(current.id) : "";

  useEffect(() => {
    const element = audio.current;
    const stop = (event: Event) => {
      if ((event as CustomEvent).detail !== "music") {
        revision.current++;
        element?.pause();
      }
    };
    window.addEventListener("site-audio", stop);
    return () => { revision.current++; element?.pause(); window.removeEventListener("site-audio", stop); };
  }, []);

  function pause() { revision.current++; audio.current?.pause(); }

  async function playLocal(track: MusicTrack = current) {
    const element = audio.current;
    if (!element || !track.src) return;
    const ticket = ++revision.current;
    const same = track.id === current.id && element.hasAttribute("src");
    element.pause(); setCurrent(track); setSource("local"); setError("");
    window.dispatchEvent(new CustomEvent("site-audio", { detail: "music" }));
    try {
      if (!same) {
        element.src = track.src; element.volume = volume.current;
        setPosition(0); setDuration(0);
      }
      await element.play();
    } catch {
      if (ticket === revision.current) setError("这段环境音暂时无法播放，请切换曲目。");
    }
  }

  function selectTrack(track: MusicTrack) {
    pause(); setCurrent(track); setError(""); setPosition(0); setDuration(0);
    setSource(track.mid ? "qq" : "local");
    dialog.current?.close();
    if (track.src) void playLocal(track);
  }

  function change(direction: number) {
    if (!localTracks.length) return;
    const next = (Math.max(localTracks.findIndex(track => track.id === current.id), 0) + direction + localTracks.length) % localTracks.length;
    void playLocal(localTracks[next]);
  }

  return <section className="music-panel" aria-label="音乐播放器">
    <div className="music-top"><span className="eyebrow"><AudioLines size={13}/> MUSIC</span><button className="playlist-trigger" onClick={() => dialog.current?.showModal()} aria-label="打开歌单列表"><ListMusic size={15}/><span>歌单 · {queue.length}</span></button></div>
    {qqPlayer ? <div className="qq-player-wrap">
      <iframe key={current.id} src={qqPlayer} title={`QQ 音乐播放器：${current.title}`} width="100%" height="65" frameBorder="0" allow="autoplay; encrypted-media" loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
    </div> : <>
      <div className="music-main"><div className="album-cover"><img src={current.cover} alt="专辑封面" width={64} height={64}/><span/></div><div className="track-info"><h3 title={current.title}>{current.title}</h3><p>{current.artist}</p><div className="music-controls">
        <button aria-label="上一首" onClick={() => change(-1)}><SkipBack size={15}/></button>
        <button className="play-button" aria-label={playing ? "暂停" : "播放"} onClick={() => playing ? pause() : void playLocal()}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
        <button aria-label="下一首" onClick={() => change(1)}><SkipForward size={15}/></button>
        <label className="volume"><Volume2 size={13}/><input aria-label="音量" type="range" min="0" max="1" step=".01" defaultValue=".45" onChange={event => { volume.current = Number(event.target.value); if (audio.current) audio.current.volume = volume.current; }}/></label>
      </div></div></div>
      <div className="track-progress"><span>{time(position)}</span><input aria-label="播放进度" type="range" min="0" max={duration || 1} step=".1" value={Math.min(position, duration || 1)} disabled={!duration} onChange={event => { if (audio.current) audio.current.currentTime = Number(event.target.value); setPosition(Number(event.target.value)); }}/><span>{time(duration || current.duration || 0)}</span></div>
    </>}
    <p className="music-status" role="status">{qqPlayer ? <>播放器由 QQ 音乐提供 · <a href={current.url} target="_blank" rel="noreferrer">打开歌曲 ↗</a></> : error}</p>
    <audio ref={audio} preload="none" onLoadedMetadata={() => { const value = audio.current?.duration; setDuration(value && Number.isFinite(value) ? value : 0); }} onPlay={() => { setPlaying(true); setError(""); }} onPause={() => setPlaying(false)} onTimeUpdate={() => setPosition(audio.current?.currentTime || 0)} onEnded={() => change(1)} onError={() => { setPlaying(false); setError("这段环境音暂时无法播放，请切换曲目。"); }}/>
    <dialog ref={dialog} className="playlist-dialog" aria-labelledby="playlist-heading" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header className="playlist-header"><div><span className="eyebrow">MY MUSIC</span><h2 id="playlist-heading">我的歌单</h2></div><button className="icon-button" aria-label="关闭歌单" onClick={() => dialog.current?.close()}><X size={20}/></button></header>
      <div className="playlist-tabs" role="group" aria-label="歌单来源"><button aria-pressed={source === "qq"} onClick={() => setSource("qq")}>QQ 音乐 <small>{qqTracks.length}</small></button><button aria-pressed={source === "local"} onClick={() => setSource("local")}>环境音 <small>{localTracks.length}</small></button></div>
      {source === "qq" && <div className="playlist-info"><p>{snapshot.title}</p><div><a href={snapshot.url} target="_blank" rel="noreferrer">打开原歌单 <ExternalLink size={12}/></a></div></div>}
      <ol className="playlist-tracks">{queue.map((track, index) => <li key={track.id} className={track.id === current.id ? "current-track" : ""}>
        <button className="playlist-song" onClick={() => selectTrack(track)} aria-label={`${track.mid ? "选择" : "播放"} ${track.title}，${track.artist}`}><span className="song-number">{track.id === current.id ? <AudioLines size={15}/> : String(index + 1).padStart(2, "0")}</span><img src={track.cover} alt="" width={40} height={40} loading="lazy"/><span className="song-description"><b>{track.title}</b><small>{track.artist}</small></span><span className="song-length">{track.requiresSubscription ? "VIP" : time(track.duration || 0)}</span></button>
        {track.url && <a className="song-external" href={track.url} target="_blank" rel="noreferrer" aria-label={`在 QQ 音乐打开 ${track.title}`}><ExternalLink size={14}/></a>}
      </li>)}</ol>
      <footer className="playlist-footer"><p role="status">{source === "qq" ? "选择歌曲后使用 QQ 音乐外链播放器收听；受版权或地区限制的歌曲可前往 QQ 音乐。" : "本站原创环境音。"}</p>{error && <p role="status">{error}</p>}</footer>
    </dialog>
  </section>;
}
