import { getPosts, getCategoryOfPost, type Post } from "@/lib/posts";
/**
 * 系列文章：slug 形如 kg-03-xxx 的属于「知识图谱」系列。
 * 编号按文章顺序从 1 开始（kg-00 是第 1/9 篇），不是 slug 里的数字。
 */
export type SeriesItem = { slug:string; title:string; readingTime:number; index:number };
export type Series = { key:string; name:string; href:string; total:number; index:number; items:SeriesItem[]; previous?:SeriesItem; next?:SeriesItem };
const SERIES:{key:string;name:string;pattern:RegExp}[] = [
  { key:"kg", name:"知识图谱", pattern:/^kg-(\d+)-/ },
];
function membersOf(def:(typeof SERIES)[number], posts:Post[]):SeriesItem[]{
  return posts
    .map(p=>({p,m:def.pattern.exec(p.slug)}))
    .filter((x):x is {p:Post;m:RegExpExecArray}=>Boolean(x.m))
    .sort((a,b)=>Number(a.m[1])-Number(b.m[1])||a.p.slug.localeCompare(b.p.slug))
    .map(({p},i)=>({slug:p.slug,title:p.title,readingTime:p.readingTime,index:i+1}));
}
export function getSeries(slug:string):Series|undefined{
  const def=SERIES.find(s=>s.pattern.test(slug));
  if(!def)return undefined;
  const items=membersOf(def,getPosts());
  const at=items.findIndex(i=>i.slug===slug);
  if(at<0)return undefined;
  const category=getCategoryOfPost(slug);
  return {key:def.key,name:def.name,href:category?`/categories/${category.slug}/`:"/blog/",total:items.length,index:at+1,items,previous:items[at-1],next:items[at+1]};
}
/** 系列内的排序键，供列表在同一天内保持文章顺序。不属于系列的返回 -1。 */
export function seriesOrder(slug:string):number{
  for(const def of SERIES){const m=def.pattern.exec(slug);if(m)return Number(m[1])}
  return -1;
}
/**
 * 正文里「第 03 篇」「第 01、02 篇」「第 03 到 06 篇」这类写法用的是 slug 数字。
 * 渲染时换成「第 4/9 篇」并链到对应文章；代码块、已有链接里的不动。
 */
export function linkSeriesRefs(html:string, series:Series):string{
  const bySlugNumber=new Map<number,SeriesItem>();
  const def=SERIES.find(s=>s.key===series.key)!;
  for(const item of series.items){const m=def.pattern.exec(item.slug);if(m)bySlugNumber.set(Number(m[1]),item)}
  const ref=(digits:string)=>{
    const item=bySlugNumber.get(Number(digits));
    if(!item)return digits;
    const label=`${item.index}/${series.total}`;
    return item.slug===series.items[series.index-1].slug
      ?`<span class="ft-series-ref is-current" title="就是本篇">${label}</span>`
      :`<a class="ft-series-ref" href="/blog/${item.slug}/" title="${series.name} · 第 ${label} 篇 · ${item.title}">${label}</a>`;
  };
  const pattern=/第\s*(\d{2})((?:\s*(?:、|，|,|和|与|及|到|至|-|–|~)\s*\d{2})*)\s*篇/g;
  let skip=0;
  return html.split(/(<[^>]+>)/).map(part=>{
    if(part.startsWith("<")){
      const tag=/^<(\/?)(pre|code|a)\b/i.exec(part);
      if(tag)skip+=tag[1]?-1:1;
      return part;
    }
    if(skip>0)return part;
    return part.replace(pattern,(_all,first:string,rest:string)=>`第 ${ref(first)}${rest.replace(/(\s*)(\d{2})/g,(_m,space:string,d:string)=>`${space}${ref(d)}`)} 篇`);
  }).join("");
}
