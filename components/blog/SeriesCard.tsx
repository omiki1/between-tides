"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import type { Series } from "@/lib/series";
/**
 * 系列进度卡：9 个泡泡，已读的实心、当前的发光、未读的空心。
 * 已读记录只存在本机 localStorage；读到文末翻页区时记为已读。
 */
const KEY=(series:string)=>`series-read:${series}`;
function readSet(series:string):Set<string>{try{return new Set(JSON.parse(localStorage.getItem(KEY(series))||"[]"))}catch{return new Set()}}
export function SeriesCard({series}:{series:Series}){
  const current=series.items[series.index-1];
  const [read,setRead]=useState<Set<string>>(()=>new Set());
  useEffect(()=>{
    const sync=()=>setRead(readSet(series.key));
    const frame=requestAnimationFrame(sync);
    const end=document.querySelector(".post-pager");
    if(!end)return ()=>cancelAnimationFrame(frame);
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(e=>e.isIntersecting))return;
      const next=readSet(series.key);next.add(current.slug);
      try{localStorage.setItem(KEY(series.key),JSON.stringify([...next]))}catch{/* 隐私模式 */}
      setRead(next);observer.disconnect();
    });
    observer.observe(end);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect()};
  },[series.key,current.slug]);
  const readCount=series.items.filter(i=>read.has(i.slug)).length;
  const left=series.items.filter(i=>!read.has(i.slug)&&i.slug!==current.slug).reduce((sum,i)=>sum+i.readingTime,0);
  const leftLabel=left>=90?`约 ${Math.round(left/60)} 小时`:`约 ${left} 分钟`;
  return <section className="ft-series" aria-label={`${series.name}系列导航`} data-pagefind-ignore="all">
    <div className="ft-series-top">
      <small>SERIES · {series.name}</small>
      <strong>第 {series.index}/{series.total} 篇{readCount>0&&<em>已读 {readCount}{left>0?` · 剩下 ${leftLabel}`:" · 全部读完"}</em>}</strong>
    </div>
    <ol className="ft-series-steps">
      {series.items.map(item=>{
        const state=item.slug===current.slug?"current":read.has(item.slug)?"read":"";
        const label=`第 ${item.index}/${series.total} 篇 · ${item.title}`;
        return <li key={item.slug} className={state||undefined}>
          {state==="current"
            ?<span aria-current="page" data-tip={label} aria-label={`${label}（本篇）`} tabIndex={0}><i className="ft-bubble"/></span>
            :<Link href={`/blog/${item.slug}/`} prefetch={false} data-tip={label} aria-label={`${label}${state==="read"?"（已读）":""}`}><i className="ft-bubble"/></Link>}
        </li>;
      })}
    </ol>
    <div className="ft-series-foot">
      {series.previous?<Link href={`/blog/${series.previous.slug}/`} prefetch={false}>← 第 {series.previous.index}/{series.total} 篇<span className="t"> · {series.previous.title}</span></Link>:<span/>}
      <Link href={series.href} prefetch={false}>整个系列</Link>
      {series.next?<Link href={`/blog/${series.next.slug}/`} prefetch={false}>第 {series.next.index}/{series.total} 篇<span className="t"> · {series.next.title}</span> →</Link>:<span/>}
    </div>
  </section>;
}
