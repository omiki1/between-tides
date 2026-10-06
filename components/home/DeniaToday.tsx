"use client";
/* eslint-disable @next/next/no-img-element -- 固定 4:5 小图，已手写 240w/480w，懒加载 */
import { useRef } from "react";
import { Play } from "lucide-react";
import { useLocalClock } from "@/lib/use-local-clock";
import { getDeniaLine } from "@/lib/denia-lines";
import { deniaTodayArt, deniaTodaySrc } from "@/data/denia-today";

const DAY = 864e5;
const pad = (n: number) => String(n).padStart(2, "0");
/** 本地日期的「第几天」：用浏览器时区，过了午夜就换下一张 */
const localDayNumber = (d: Date) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);

/**
 * 首页右栏的「今日达妮娅」：按浏览器里的当天日期从官方图池挑一张，配一句台词。
 * 静态导出时服务端没有「今天」，所以首屏 HTML 只有占位框（尺寸固定，不会跳动），
 * 挂载后才填图与台词。
 */
export function DeniaToday() {
  const now = useLocalClock();
  const audio = useRef<HTMLAudioElement | null>(null);
  const art = now ? deniaTodayArt[localDayNumber(now) % deniaTodayArt.length] : null;
  const line = now ? getDeniaLine("home-today", now) : null;
  const play = () => {
    if (!line?.src) return;
    audio.current?.pause();
    audio.current = new Audio(line.src);
    void audio.current.play().catch(() => {});
  };
  return (
    <article className="widget-card ft-today" aria-label="今日达妮娅" data-pagefind-ignore="all">
      <div className="ft-today-head">
        <span className="eyebrow">TODAY · 今日达妮娅</span>
        {now && <time dateTime={`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`}>{pad(now.getMonth() + 1)}.{pad(now.getDate())}</time>}
      </div>
      <div className="ft-today-body">
        <figure className="ft-today-frame">
          {art && <img key={art.id} src={deniaTodaySrc(art.id, 240)} srcSet={`${deniaTodaySrc(art.id, 240)} 240w, ${deniaTodaySrc(art.id, 480)} 480w`}
            sizes="(max-width: 980px) 112px, 208px" width={240} height={300} alt={art.alt} loading="lazy" decoding="async" />}
        </figure>
        <div className="ft-today-text">
          <p className="ft-today-line">{line ? <>「{line.text}」</> : "\u00a0"}
            {line?.src && <button type="button" className="ft-today-play" onClick={play} aria-label={`听达妮娅说：${line.text}`}><Play size={10} /></button>}
          </p>
          <small className="ft-art-credit">OFFICIAL ART · KURO GAMES <b>· {art ? art.credit : "鸣潮"}</b></small>
        </div>
      </div>
    </article>
  );
}
