/**
 * Cmd+K 的浏览器端搜索：Pagefind 负责排序、摘要和小节定位，这里补一层中文整词校验。
 *
 * 为什么要补：Pagefind 对不带空格的中文复合词召回不足（实测「知识图谱」只命中 1 页，实际 12 页都有）。
 * 做法：把查询词用 Intl.Segmenter 拆成词，多查几次扩大候选，再逐页核对原词是否真的出现，
 * 出现的归「完全匹配」，没出现的归「相关」并排在后面。
 *
 * Pagefind 不可用时（next dev 下没有 /pagefind/），退回 /search.json 做子串匹配。
 */
export type SearchHit = { url:string; title:string; subTitle?:string|null; excerpt:string; section:string; exact:boolean };
type PagefindData = { url:string; content:string; excerpt:string; meta?:Record<string,string>; filters?:Record<string,string[]>; sub_results?:{url:string;title:string;excerpt:string}[] };
type PagefindResult = { id:string; data:()=>Promise<PagefindData> };
export type Pagefind = { search:(q:string)=>Promise<{results:PagefindResult[]}>; options?:(o:Record<string,unknown>)=>Promise<void>; init?:()=>Promise<void> };
type LegacyEntry = { title:string; href:string; kind:string; excerpt:string; keywords:string };

export const SECTION_ORDER = ["文章","项目","随记","相册","追番","页面"];
const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
const norm = (s:string) => s.toLowerCase().replace(/\s+/g,"");
const esc = (s:string) => s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]!));
const strip = (s:string) => s.replace(/<[^>]+>/g,"");

let pagefindPromise:Promise<Pagefind|null>|null=null;
export function loadPagefind():Promise<Pagefind|null>{
  const url="/pagefind/pagefind.js";
  pagefindPromise??=import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
    .then(async (mod:Pagefind)=>{await mod.options?.({excerptLength:28});await mod.init?.();return mod})
    .catch(()=>null);
  return pagefindPromise;
}

export async function searchPagefind(pf:Pagefind, raw:string, limit=24):Promise<SearchHit[]>{
  const q=raw.trim();
  if(!q)return [];
  const queries=new Set([q]);
  if(CJK.test(q)&&!/\s/.test(q)&&typeof Intl!=="undefined"&&"Segmenter" in Intl){
    const seg=new Intl.Segmenter("zh-CN",{granularity:"word"});
    for(const {segment,isWordLike} of seg.segment(q))if(isWordLike&&segment.length>=2)queries.add(segment);
  }
  const searches=await Promise.all([...queries].map(x=>pf.search(x)));
  const seen=new Map<string,{r:PagefindResult;score:number}>();
  searches.forEach((s,qi)=>s.results.forEach((r,i)=>{
    const score=(qi===0?0:0.5)+i;
    const prev=seen.get(r.id);
    if(!prev||score<prev.score)seen.set(r.id,{r,score});
  }));
  const candidates=[...seen.values()].sort((a,b)=>a.score-b.score).slice(0,limit);
  const datas=await Promise.all(candidates.map(c=>c.r.data()));
  const nq=norm(q);
  const words=[...queries].slice(1).map(norm);
  const hits=datas.flatMap(d=>{
    const hay=norm(`${d.meta?.title||""} ${d.content}`);
    const exact=hay.includes(nq);
    // 「相关」至少要真的包含拆出来的某个词；只靠单字模糊命中的不算（否则「量子纠缠」会冒出一堆无关文章）
    if(!exact&&CJK.test(q)&&!words.some(w=>hay.includes(w)))return [];
    return [toHit(d,q,exact)];
  });
  // 中文查询：完全匹配在前，只命中部分词的放后面
  return CJK.test(q)?[...hits.filter(h=>h.exact),...hits.filter(h=>!h.exact)]:hits.map(h=>({...h,exact:true}));
}

function toHit(d:PagefindData,q:string,exact:boolean):SearchHit{
  let excerpt=d.excerpt, url=d.url, subTitle:string|null=null;
  const nq=norm(q);
  const sub=(d.sub_results||[]).filter(s=>s.url!==d.url).find(s=>norm(strip(s.excerpt)).includes(nq));
  if(sub){url=sub.url;subTitle=sub.title;excerpt=sub.excerpt}
  if(exact&&CJK.test(q)){
    const plain=strip(excerpt);
    const at=plain.indexOf(q);
    if(at>=0)excerpt=esc(plain.slice(0,at))+"<mark>"+esc(q)+"</mark>"+esc(plain.slice(at+q.length));
    else{
      const i=d.content.indexOf(q);
      if(i>=0){const a=Math.max(0,i-22),b=Math.min(d.content.length,i+q.length+30);
        excerpt=(a>0?"…":"")+esc(d.content.slice(a,i))+"<mark>"+esc(q)+"</mark>"+esc(d.content.slice(i+q.length,b))+(b<d.content.length?"…":"")}
    }
  }
  return {url,title:d.meta?.title||d.url,subTitle,excerpt,section:d.filters?.section?.[0]||"页面",exact};
}

let legacy:Promise<LegacyEntry[]>|null=null;
const LEGACY_SECTION:Record<string,string>={"文章":"文章","项目":"项目","随记":"随记","图集":"相册","追番":"追番"};
export async function searchLegacy(raw:string):Promise<SearchHit[]>{
  legacy??=fetch("/search.json").then(r=>{if(!r.ok)throw new Error("index unavailable");return r.json()});
  const term=raw.trim().toLowerCase();
  const list=await legacy;
  return list.filter(e=>e.title.toLowerCase().includes(term)||e.keywords.includes(term)||e.excerpt.toLowerCase().includes(term)).slice(0,24)
    .map(e=>({url:e.href,title:e.title,excerpt:esc(e.excerpt),section:LEGACY_SECTION[e.kind]||"页面",exact:true}));
}

export function groupBySection(hits:SearchHit[]):[string,SearchHit[]][]{
  const groups=new Map<string,SearchHit[]>();
  for(const hit of hits){if(!groups.has(hit.section))groups.set(hit.section,[]);groups.get(hit.section)!.push(hit)}
  return [...groups].sort((a,b)=>(SECTION_ORDER.indexOf(a[0])+99)%99-(SECTION_ORDER.indexOf(b[0])+99)%99);
}
