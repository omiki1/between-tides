"use client";
import { useEffect,useState } from "react";
import { Hourglass,X } from "lucide-react";
/**
 * 过期提醒：文章（或 frontmatter 里的 updated）超过一年没更新时，在正文顶部提示一句。
 * 年龄必须在浏览器里算——站点是静态导出，构建时算出的天数会随时间失真。
 * 关掉后按「路径 + 更新日期」记住；文章再次更新会重新出现。
 */
const DAY=864e5;
export const OUTDATED_AFTER_DAYS=365;
export function OutdatedNotice({date,updated,seriesHref}:{date:string;updated?:string;seriesHref?:string}){
  const stamp=updated||date;
  const [days,setDays]=useState<number|null>(null);
  const [leaving,setLeaving]=useState(false);
  useEffect(()=>{
    const age=Math.floor((Date.now()-new Date(`${stamp}T00:00:00+09:00`).getTime())/DAY);
    let dismissed=false;
    try{dismissed=localStorage.getItem(`outdated-dismissed:${location.pathname}`)===stamp}catch{/* 隐私模式 */}
    if(age>OUTDATED_AFTER_DAYS&&!dismissed){const id=requestAnimationFrame(()=>setDays(age));return ()=>cancelAnimationFrame(id)}
  },[stamp]);
  if(days===null)return null;
  const close=()=>{
    try{localStorage.setItem(`outdated-dismissed:${location.pathname}`,stamp)}catch{/* 隐私模式 */}
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)setDays(null); else setLeaving(true);
  };
  const years=Math.floor(days/365);
  return <aside className={`ft-outdated${leaving?" is-leaving":""}`} data-level={days>730?"2":"1"} role="note" data-pagefind-ignore="all" onAnimationEnd={()=>{if(leaving)setDays(null)}}>
    <Hourglass className="ft-outdated-icon" size={18} aria-hidden="true"/>
    <div>
      <strong>这篇{updated?"最后更新于":"写于"} {years>=1?`${years} 年多`:`${days} 天`}前，部分内容可能已经过时</strong>
      <p>时间停在 <time dateTime={stamp}>{stamp.replaceAll("-",".")}</time>。版本号、接口这类东西变得快，照着做之前记得对一下最新文档。</p>
      <div className="ft-outdated-actions"><a href="/blog/">看看最近写了什么</a>{seriesHref&&<a href={seriesHref}>同系列的其他篇</a>}</div>
    </div>
    <button type="button" className="ft-outdated-close" onClick={close} aria-label="知道了，关闭提示" title="知道了"><X size={15}/></button>
  </aside>;
}
