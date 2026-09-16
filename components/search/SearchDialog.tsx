"use client";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { Search,X,CornerDownLeft } from "lucide-react";
import { site } from "@/config/site";
import type { SearchEntry } from "@/lib/search";
export function SearchDialog(){
  const router=useRouter();
  const dialog=useRef<HTMLDialogElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const [index,setIndex]=useState<SearchEntry[]|null>(null);
  const [query,setQuery]=useState("");
  const [cursor,setCursor]=useState(0);
  const [resolved,setResolved]=useState({query:"",ready:false});
  const [unavailable,setUnavailable]=useState(false);
  const load=useCallback(()=>{
    if(index)return;
    fetch("/search.json").then(response=>{if(!response.ok)throw new Error("index unavailable");return response.json()}).then((data:SearchEntry[])=>setIndex(data)).catch(()=>setUnavailable(true));
  },[index]);
  const open=useCallback(()=>{load();dialog.current?.showModal();requestAnimationFrame(()=>input.current?.focus())},[load]);
  const close=useCallback(()=>{dialog.current?.close()},[]);
  useEffect(()=>{
    const onOpen=()=>open();
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
        event.preventDefault();
        if(dialog.current?.open)close(); else open();
      }
    };
    window.addEventListener("open-search",onOpen);
    window.addEventListener("keydown",onKey);
    return ()=>{window.removeEventListener("open-search",onOpen);window.removeEventListener("keydown",onKey)};
  },[open,close]);
  const results=useMemo(()=>{
    const term=query.trim().toLowerCase();
    const source=index??[];
    if(!term)return source.filter(entry=>entry.kind==="文章").slice(0,5);
    return source.filter(entry=>entry.title.toLowerCase().includes(term)||entry.keywords.includes(term)||entry.excerpt.toLowerCase().includes(term)).slice(0,8);
  },[index,query]);
  const grouped=useMemo(()=>{
    const order=["文章","项目","随记","图集","页面"];
    return [...results].sort((a,b)=>order.indexOf(a.kind)-order.indexOf(b.kind));
  },[results]);
  /* Reset the highlighted row while rendering when the query or the index changes. */
  if(resolved.query!==query||resolved.ready!==Boolean(index)){
    setResolved({query,ready:Boolean(index)});
    setCursor(0);
  }
  const go=useCallback((entry?:SearchEntry)=>{
    if(!entry)return;
    dialog.current?.close();
    setQuery("");
    router.push(entry.href);
  },[router]);
  function onInputKeyDown(event:React.KeyboardEvent<HTMLInputElement>){
    if(event.key==="ArrowDown"){event.preventDefault();setCursor(value=>Math.min(value+1,grouped.length-1))}
    if(event.key==="ArrowUp"){event.preventDefault();setCursor(value=>Math.max(value-1,0))}
    if(event.key==="Enter"){event.preventDefault();go(grouped[cursor])}
  }
  return <dialog ref={dialog} className="search-dialog" aria-label="站内搜索" onClose={()=>setQuery("")} onClick={event=>{if(event.target===event.currentTarget)close()}}>
    <div className="search-panel">
      <div className="search-field">
        <Search size={17}/>
        <input ref={input} value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={onInputKeyDown} type="search" placeholder="搜文章、项目、随记或图片…" aria-label="搜索关键词" aria-controls="search-results" autoComplete="off"/>
        <button className="icon-button" onClick={close} aria-label="关闭搜索"><X size={17}/></button>
      </div>
      {unavailable&&<p className="search-empty">搜索索引暂时没有加载成功。可以直接浏览{site.nav.filter(item=>item.href!=="/").map(item=>(<a key={item.href} href={item.href}>{item.label}</a>))}。</p>}
      {!unavailable&&!index&&<p className="search-empty">正在准备搜索索引…</p>}
      {!unavailable&&index&&<>
        <p className="search-hint">{query.trim()?`${grouped.length} 条结果`:"试试从最近的手记开始"}</p>
        <ul id="search-results" className="search-results" role="listbox" aria-label="搜索结果">
          {grouped.map((entry,position)=><li key={`${entry.kind}-${entry.href}-${entry.title}`} role="option" aria-selected={position===cursor}>
            <button onMouseEnter={()=>setCursor(position)} onClick={()=>go(entry)}>
              <span className="result-kind">{entry.kind}</span>
              <span className="result-body"><b>{entry.title}</b><small>{entry.excerpt}</small></span>
              <CornerDownLeft size={14}/>
            </button>
          </li>)}
        </ul>
        {!grouped.length&&<p className="search-empty">没有找到「{query}」相关的内容，换一个更短的关键词试试。</p>}
      </>}
      <div className="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></div>
    </div>
  </dialog>;
}
