"use client";
import { useEffect } from "react";
/** 目录高亮小岛：观察正文标题，把当前小节对应的目录链接标成 aria-current="location"。 */
export function TocObserver(){
  useEffect(()=>{
    const links=Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]'));
    const byId=new Map<string,HTMLAnchorElement>();
    const targets:HTMLElement[]=[];
    for(const link of links){
      const id=decodeURIComponent(link.hash.slice(1));
      const el=document.getElementById(id);
      if(el){byId.set(id,link);targets.push(el)}
    }
    if(!targets.length)return;
    let active="";
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      const id=visible[0]?.target.id;
      if(!id||id===active)return;
      byId.get(active)?.removeAttribute("aria-current");
      byId.get(id)?.setAttribute("aria-current","location");
      active=id;
    },{rootMargin:"-110px 0px -65% 0px",threshold:[0,1]});
    targets.forEach(target=>observer.observe(target));
    return ()=>{observer.disconnect();byId.get(active)?.removeAttribute("aria-current")};
  },[]);
  return null;
}
