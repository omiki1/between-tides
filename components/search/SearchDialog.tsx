"use client";
import { useCallback,useEffect,useMemo,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { Search,X,CornerDownLeft,Play } from "lucide-react";
import voices from "@/data/denia-voices.json";
import { groupBySection,loadPagefind,searchLegacy,searchPagefind,type SearchHit } from "@/lib/search-client";
export type SearchSeed = { recent:{title:string;href:string;excerpt:string}[]; suggestions:{label:string;href:string;query?:string}[] };
type State = { query:string; hits:SearchHit[]; status:"idle"|"loading"|"done"|"error" };
export function SearchDialog({seed}:{seed:SearchSeed}){
  const router=useRouter();
  const dialog=useRef<HTMLDialogElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const [query,setQuery]=useState("");
  const [state,setState]=useState<State>({query:"",hits:[],status:"idle"});
  const [cursor,setCursor]=useState(0);
  const [voice,setVoice]=useState(0);
  const open=useCallback(()=>{void loadPagefind();dialog.current?.showModal();requestAnimationFrame(()=>input.current?.focus())},[]);
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
  /* 输入停顿 140ms 再查；只采用最后一次查询的结果。 */
  useEffect(()=>{
    const term=query.trim();
    if(!term)return;
    let cancelled=false;
    const timer=window.setTimeout(async()=>{
      setState(prev=>({...prev,status:"loading"}));
      try{
        const pf=await loadPagefind();
        const hits=pf?await searchPagefind(pf,term):await searchLegacy(term);
        if(!cancelled){setState({query:term,hits,status:"done"});setCursor(0);setVoice(Math.floor(Math.random()*voices.length))}
      }catch{ if(!cancelled)setState({query:term,hits:[],status:"error"}) }
    },140);
    return ()=>{cancelled=true;window.clearTimeout(timer)};
  },[query]);
  const term=query.trim();
  const showing=term&&state.query===term;
  const groups=useMemo(()=>showing?groupBySection(state.hits):[],[showing,state.hits]);
  const indexed=useMemo(()=>{let i=0;return groups.map(([section,hits])=>[section,hits.map(hit=>({...hit,index:i++}))] as const)},[groups]);
  const flat=useMemo(()=>term?groups.flatMap(([,hits])=>hits.map(h=>h.url)):seed.recent.map(r=>r.href),[term,groups,seed.recent]);
  const go=useCallback((href?:string)=>{
    if(!href)return;
    dialog.current?.close();
    setQuery("");
    router.push(href);
  },[router]);
  function onInputKeyDown(event:React.KeyboardEvent<HTMLInputElement>){
    if(event.key==="ArrowDown"){event.preventDefault();setCursor(value=>Math.min(value+1,flat.length-1))}
    if(event.key==="ArrowUp"){event.preventDefault();setCursor(value=>Math.max(value-1,0))}
    if(event.key==="Enter"){event.preventDefault();go(flat[cursor])}
  }
  const line=voices[voice%voices.length];
  const playVoice=()=>{try{void new Audio(line.src).play()}catch{/* 浏览器拒绝播放时静默 */}};
  return <dialog ref={dialog} className="search-dialog" aria-label="站内搜索" onClose={()=>{setQuery("");setCursor(0)}} onClick={event=>{if(event.target===event.currentTarget)close()}}>
    <div className="search-panel">
      <div className="search-field">
        <Search size={17}/>
        <input ref={input} value={query} onChange={event=>{setQuery(event.target.value);setCursor(0)}} onKeyDown={onInputKeyDown} type="search" placeholder="搜文章、项目、随记或图片…" aria-label="搜索关键词" aria-controls="search-results" autoComplete="off"/>
        <button className="icon-button" onClick={close} aria-label="关闭搜索"><X size={17}/></button>
      </div>
      {!term&&<>
        <p className="search-hint">试试从最近的手记开始</p>
        <ul id="search-results" className="search-results" role="listbox" aria-label="最近的手记">
          {seed.recent.map((entry,index)=><li key={entry.href} role="option" aria-selected={index===cursor}>
            <button onMouseEnter={()=>setCursor(index)} onClick={()=>go(entry.href)}>
              <span className="result-kind">文章</span>
              <span className="result-body"><b>{entry.title}</b><small>{entry.excerpt}</small></span>
              <CornerDownLeft size={14}/>
            </button>
          </li>)}
        </ul>
      </>}
      {term&&!showing&&<p className="search-empty" aria-live="polite">正在找「{term}」…</p>}
      {showing&&state.status==="error"&&<p className="search-empty">搜索暂时没有加载成功，稍后再试一次。</p>}
      {showing&&state.status!=="error"&&groups.length>0&&<>
        <p className="search-hint" aria-live="polite">{state.hits.length} 条结果</p>
        <ul id="search-results" className="search-results" role="listbox" aria-label="搜索结果">
          {indexed.map(([section,hits])=><li key={section} role="presentation" className="ft-search-group">
            <span className="ft-search-group-head" aria-hidden="true">{section}<i>{hits.length}</i></span>
            <ul role="group" aria-label={section}>
              {hits.map(hit=><li key={hit.url} role="option" aria-selected={hit.index===cursor}>
                <button onMouseEnter={()=>setCursor(hit.index)} onClick={()=>go(hit.url)}>
                  <span className="result-kind">{hit.exact?section:"相关"}</span>
                  <span className="result-body"><b>{hit.title}{hit.subTitle&&hit.subTitle!==hit.title?<em className="ft-search-sub"> · {hit.subTitle}</em>:null}</b><small dangerouslySetInnerHTML={{__html:hit.excerpt}}/></span>
                  <CornerDownLeft size={14}/>
                </button>
              </li>)}
            </ul>
          </li>)}
        </ul>
      </>}
      {showing&&state.status==="done"&&!groups.length&&<div className="ft-search-empty" role="status">
        <span className="ft-search-avatar" aria-hidden="true">
          <img src="/artwork/denia/face-circle-160.webp" srcSet="/artwork/denia/face-circle-160.webp 1x, /artwork/denia/face-circle-320.webp 2x" alt="" width={72} height={72} loading="lazy" decoding="async"/>
          <i className="ft-bubble b1"/><i className="ft-bubble b2"/>
        </span>
        <div>
          <p className="ft-search-voice"><q>{line.text}</q><button type="button" onClick={playVoice} aria-label={`播放达妮娅语音：${line.text}`}><Play size={10}/>语音</button></p>
          <p className="ft-search-sub-line">没有找到「{term}」。换一个更短的词，或者从这里开始：</p>
          <div className="ft-search-chips">
            {seed.suggestions.map(s=>s.query
              ?<button type="button" key={s.label} onClick={()=>{setQuery(s.query!);input.current?.focus()}}>{s.label}</button>
              :<a key={s.label} href={s.href} onClick={event=>{event.preventDefault();go(s.href)}}>{s.label}</a>)}
          </div>
          <small className="ft-art-credit">OFFICIAL ART · KURO GAMES <b>· 鸣潮角色资料图</b></small>
        </div>
      </div>}
      <div className="search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span></div>
    </div>
  </dialog>;
}
