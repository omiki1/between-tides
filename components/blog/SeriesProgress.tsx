"use client";
import { useEffect } from "react";
/**
 * SeriesCard 的「已读」小岛：不渲染任何东西，只在挂载后（页面空闲时）
 * 读 localStorage 给已读的泡泡加 .read，并在文末翻页区进入视口时把本篇记为已读。
 */
const KEY=(series:string)=>`series-read:${series}`;
function readSet(series:string):Set<string>{try{return new Set(JSON.parse(localStorage.getItem(KEY(series))||"[]"))}catch{return new Set()}}
function paint(card:HTMLElement,read:Set<string>){
  const current=card.dataset.current;
  const items=Array.from(card.querySelectorAll<HTMLLIElement>(".ft-series-steps li[data-slug]"));
  let count=0,left=0;
  for(const li of items){
    const slug=li.dataset.slug!;const isRead=read.has(slug);
    if(isRead)count++;else if(slug!==current)left+=Number(li.dataset.minutes)||0;
    if(slug===current)continue;
    li.classList.toggle("read",isRead);
    const link=li.querySelector("a");
    const tip=link?.dataset.tip;
    if(link&&tip)link.setAttribute("aria-label",`${tip}${isRead?"（已读）":""}`);
  }
  const em=card.querySelector<HTMLElement>("[data-series-read]");
  if(!em)return;
  if(count>0){
    const leftLabel=left>=90?`约 ${Math.round(left/60)} 小时`:`约 ${left} 分钟`;
    em.textContent=`已读 ${count}${left>0?` · 剩下 ${leftLabel}`:" · 全部读完"}`;
    em.hidden=false;
  }else em.hidden=true;
}
export function SeriesProgress(){
  useEffect(()=>{
    const card=document.querySelector<HTMLElement>(".ft-series[data-series]");
    if(!card)return;
    const key=card.dataset.series!,current=card.dataset.current!;
    paint(card,readSet(key));
    const end=document.querySelector(".post-pager");
    if(!end)return;
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(e=>e.isIntersecting))return;
      const next=readSet(key);next.add(current);
      try{localStorage.setItem(KEY(key),JSON.stringify([...next]))}catch{/* 隐私模式 */}
      paint(card,next);observer.disconnect();
    });
    observer.observe(end);
    return ()=>observer.disconnect();
  },[]);
  return null;
}
