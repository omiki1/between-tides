"use client";
/* eslint-disable @next/next/no-img-element -- 固定尺寸的官方立绘裁切，已手写 220w/440w，懒加载 */
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Play } from "lucide-react";
import { deniaVoices as voices, claimVoice, releaseVoice } from "@/lib/deniaVoices";

/**
 * 文末的「读完啦」小角落：达妮娅从卡片右下角探出半身，说一句语音台词，
 * 旁边是一个泡泡形状的「回到顶部」。进入视口时才淡入（立绘也是懒加载），
 * 减少动态效果时直接显示，不做位移。
 */
export function ReadDoneCorner() {
  const root = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [line, setLine] = useState(0);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      setLine(claimVoice("read-done", { seed: String(Math.random()) }).index);
      setShown(true);
      observer.disconnect();
    }, { rootMargin: "0px 0px -12% 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); audio.current?.pause(); releaseVoice("read-done"); };
  }, []);
  const voice = voices[line];
  const play = () => {
    audio.current?.pause();
    if (!voice.src) return;
    audio.current = new Audio(voice.src);
    void audio.current.play().catch(() => {});
  };
  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
  };
  return (
    <section ref={root} className={`ft-done${shown ? " is-in" : ""}`} aria-label="读完啦" data-pagefind-ignore="all">
      <div className="ft-done-card">
        <div className="ft-done-text">
          <span className="ft-done-eyebrow">读完啦 <i>· THE END</i></span>
          <p className="ft-done-line">
            「{voice.text}」
            <button type="button" className="ft-done-play" onClick={play} aria-label={`听达妮娅说：${voice.text}`}><Play size={11} /></button>
          </p>
          <p className="ft-done-sub">辛苦啦，歇一会儿也好～</p>
          <button type="button" className="ft-done-top" onClick={toTop}><ArrowUp size={14} />回到顶部</button>
        </div>
        <img className="ft-done-denia" src="/artwork/denia/peek-220.webp" srcSet="/artwork/denia/peek-220.webp 220w, /artwork/denia/peek-440.webp 440w"
          sizes="(max-width: 700px) 128px, 188px" width={220} height={142} alt="" loading="lazy" decoding="async" />
      </div>
      <small className="ft-art-credit">OFFICIAL ART · KURO GAMES <b>· 鸣潮 2 周年宣传图</b></small>
    </section>
  );
}
