import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft,ArrowRight,ArrowUpRight,Clock,CalendarDays,Folder } from "lucide-react";
import { getCategoryOfPost, getPost, getPostSlugs, getNeighbours, slugify, coverPositionStyle } from "@/lib/posts";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { site } from "@/config/site";
import { Reveal } from "@/components/effects/Reveal";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
export function generateStaticParams(){return getPostSlugs().map(slug=>({slug}))}
export async function generateMetadata({params}:PageProps<"/blog/[slug]">):Promise<Metadata>{
  const {slug}=await params;const post=getPost(slug);
  if(!post)return {title:"没有找到这篇手记"};
  const url=`/blog/${post.slug}/`;
  return {title:post.title,description:post.description,alternates:{canonical:url},keywords:post.tags,openGraph:{type:"article",title:post.title,description:post.description,url,publishedTime:post.date,modifiedTime:post.updated||post.date,tags:post.tags,images:post.cover?[{url:post.cover,alt:post.title}]:undefined},twitter:{card:"summary_large_image",title:post.title,description:post.description,images:post.cover?[post.cover]:undefined}};
}
export default async function PostPage({params}:PageProps<"/blog/[slug]">){
  const {slug}=await params;const post=getPost(slug);
  if(!post)notFound();
  const html=await renderMarkdown(post.content);
  const headings=extractHeadings(html);
  const {previous,next}=getNeighbours(post.slug);
  const category=getCategoryOfPost(post.slug);
  const jsonLd={"@context":"https://schema.org","@type":"BlogPosting",headline:post.title,description:post.description,datePublished:post.date,dateModified:post.updated||post.date,keywords:post.tags.join(","),image:post.cover?`${site.url}${post.cover}`:undefined,url:`${site.url}/blog/${post.slug}/`,author:{"@type":"Person",name:site.nickname},publisher:{"@type":"Organization",name:site.name}};
  return <main id="main" className="container inner">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <ReadingProgress/>
    <Reveal className="reading-head">
      <Link className="back-link" href="/blog/"><ArrowLeft size={15}/>所有手记</Link>
      <div className="post-meta">{post.tags.map(t=>t.toUpperCase()).join(" / ")}<span>{post.date.replaceAll("-",".")}</span></div>
      <h1>{post.title}</h1>
      <p className="reading-lede">{post.description}</p>
      <div className="reading-facts">
        <span><CalendarDays size={14}/>{post.date.replaceAll("-",".")}</span>
        <span><Clock size={14}/>约 {post.readingTime} 分钟</span>
        {category&&<span><Folder size={14}/><Link href={`/categories/${category.slug}/`}>{category.name}</Link></span>}
      </div>
      <div className="reading-tags" aria-label="标签">
        {post.tags.map(tag=><Link key={tag} className="tag-chip" href={`/tags/${slugify(tag)}/`}># {tag}</Link>)}
      </div>
    </Reveal>
    {post.cover&&<Reveal className="reading-cover" style={coverPositionStyle(post.coverPosition)}><Image src={post.cover} alt="" fill sizes="(max-width: 900px) 100vw, 1040px" loading="eager"/></Reveal>}
    <div className="reading-layout">
      <article className="prose" dangerouslySetInnerHTML={{__html:html}}/>
      <aside className="reading-aside">
        <TableOfContents headings={headings}/>
        {category&&<div className="aside-card">
          <span className="eyebrow">CATEGORY</span>
          <p>{category.name} 分类下共 {category.count} 篇手记。</p>
          <Link className="text-link" href={`/categories/${category.slug}/`}>查看分类<ArrowUpRight size={14}/></Link>
        </div>}
        <div className="aside-card">
          <span className="eyebrow">ABOUT THIS GARDEN</span>
          <p>{site.description}</p>
          <Link className="text-link" href="/about/">关于这座小站<ArrowUpRight size={14}/></Link>
        </div>
        {post.updated&&<p className="aside-note">最后更新 {post.updated.replaceAll("-",".")}</p>}
      </aside>
    </div>
    <nav className="post-pager" aria-label="相邻手记">
      {previous?<Link href={`/blog/${previous.slug}/`}><ArrowLeft size={16}/><span><small>上一篇</small>{previous.title}</span></Link>:<span/>}
      {next?<Link href={`/blog/${next.slug}/`} className="pager-next"><span><small>下一篇</small>{next.title}</span><ArrowRight size={16}/></Link>:<span/>}
    </nav>
  </main>;
}
