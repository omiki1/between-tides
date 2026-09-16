import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
export type Post={slug:string;title:string;description:string;date:string;updated?:string;tags:string[];cover:string;featured:boolean;readingTime:number;content:string};
export type Category={name:string;slug:string;count:number;latest:string;posts:Post[]};
export type TagSummary={name:string;slug:string;count:number;latest:string};
export type ArchiveGroup={year:string;count:number;posts:Post[]};
const postsDirectory=path.join(process.cwd(),"content/posts");
/** 分类名推导：frontmatter 可用 category 覆盖，默认取第一个标签。 */
const DEFAULT_CATEGORY="随笔";
/** 与 config/site.ts 的 pagination.postsPerPage 保持一致。 */
export const POSTS_PER_PAGE=12;
export function getPosts():Post[]{return fs.readdirSync(postsDirectory).filter(f=>f.endsWith(".md")).map(f=>{const {data,content}=matter(fs.readFileSync(path.join(postsDirectory,f),"utf8"));if(typeof data.title!=="string"||typeof data.date!=="string")throw new Error(`Invalid frontmatter: ${f}`);return {slug:f.slice(0,-3),title:data.title,description:String(data.description||""),date:data.date,updated:data.updated?String(data.updated):undefined,tags:Array.isArray(data.tags)?data.tags.map(String):[],cover:String(data.cover||""),featured:!!data.featured,readingTime:Math.max(1,Math.ceil(content.replace(/\s/g,"").length/450)),content}}).sort((a,b)=>b.date.localeCompare(a.date))}
export function getPost(slug:string):Post|undefined{return getPosts().find(p=>p.slug===slug)}
export function getPostSlugs():string[]{return getPosts().map(p=>p.slug)}
export function getTags():string[]{return [...new Set(getPosts().flatMap(p=>p.tags))]}
export function getNeighbours(slug:string):{previous?:Post;next?:Post}{
  const posts=getPosts();const index=posts.findIndex(p=>p.slug===slug);
  if(index<0)return {};
  return {previous:posts[index-1],next:posts[index+1]};
}
/** 分页：page 从 1 开始；文章数不超过一页时只生成第 1 页。 */
export function getTotalPages():number{return Math.max(1,Math.ceil(getPosts().length/POSTS_PER_PAGE))}
export function getPage(page:number):Post[]{const posts=getPosts();const start=(page-1)*POSTS_PER_PAGE;return posts.slice(start,start+POSTS_PER_PAGE)}
export function getPageNumbers():number[]{return Array.from({length:getTotalPages()},(_,index)=>index+1)}

/** Frontmatter 里的 category 优先，否则用第一个标签，最后退回默认分类。 */
function categoryOf(slug:string):string{
  const file=path.join(postsDirectory,`${slug}.md`);
  const {data}=matter(fs.readFileSync(file,"utf8"));
  const declared=typeof data.category==="string"?data.category.trim():"";
  if(declared)return declared;
  const tags=Array.isArray(data.tags)?data.tags.map(String):[];
  return tags[0]||DEFAULT_CATEGORY;
}
/** 中文与空格不适合直接进 URL 片段，统一转成稳定的 slug。 */
export function slugify(value:string):string{
  return value.trim().toLowerCase().replace(/\s+/g,"-").replace(/[^\w\u4e00-\u9fa5-]/g,"").replace(/-+/g,"-");
}
export function getCategories():Category[]{
  const posts=getPosts();
  const groups=new Map<string,Post[]>();
  for(const post of posts){
    const name=categoryOf(post.slug);
    groups.set(name,[...(groups.get(name)??[]),post]);
  }
  return [...groups].map(([name,list])=>({name,slug:slugify(name),count:list.length,latest:list[0].date,posts:list})).sort((a,b)=>b.count-a.count||b.latest.localeCompare(a.latest));
}
export function getCategory(slug:string):Category|undefined{return getCategories().find(category=>category.slug===slug)}
export function getCategoryOfPost(slug:string):Category|undefined{
  const name=categoryOf(slug);
  return getCategories().find(category=>category.name===name);
}
export function getTagSummaries():TagSummary[]{
  const posts=getPosts();
  const groups=new Map<string,Post[]>();
  for(const post of posts)for(const tag of post.tags)groups.set(tag,[...(groups.get(tag)??[]),post]);
  return [...groups].map(([name,list])=>({name,slug:slugify(name),count:list.length,latest:list[0].date})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,"zh"));
}
export function getPostsByTag(slug:string):Post[]{return getPosts().filter(post=>post.tags.some(tag=>slugify(tag)===slug))}
/** 归档：按年份分组，年份内保持日期倒序。 */
export function getArchive():ArchiveGroup[]{
  const groups=new Map<string,Post[]>();
  for(const post of getPosts()){
    const year=post.date.slice(0,4);
    groups.set(year,[...(groups.get(year)??[]),post]);
  }
  return [...groups].map(([year,posts])=>({year,count:posts.length,posts})).sort((a,b)=>b.year.localeCompare(a.year));
}
