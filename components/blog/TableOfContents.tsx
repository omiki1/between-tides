"use client";
import { useEffect,useState } from "react";
import type { Heading } from "@/lib/markdown";
export function TableOfContents({headings}:{headings:Heading[]}){
  const [active,setActive]=useState("");
  useEffect(()=>{
    const targets=headings.map(h=>document.getElementById(h.id)).filter((el):el is HTMLElement=>Boolean(el));
    if(!targets.length)return;
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      if(visible[0])setActive(visible[0].target.id);
    },{rootMargin:"-110px 0px -65% 0px",threshold:[0,1]});
    targets.forEach(target=>observer.observe(target));
    return ()=>observer.disconnect();
  },[headings]);
  if(!headings.length)return null;
  return <nav className="toc" aria-label="本页目录">
    <span className="eyebrow">ON THIS PAGE</span>
    <ol>{headings.map(heading=><li key={heading.id} className={heading.depth===3?"depth-3":undefined}>
      <a href={`#${heading.id}`} aria-current={active===heading.id?"location":undefined}>{heading.text}</a>
    </li>)}</ol>
  </nav>;
}
