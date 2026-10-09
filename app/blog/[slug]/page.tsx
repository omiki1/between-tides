import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft,ArrowRight,ArrowUpRight,Clock,CalendarDays,Folder,RefreshCw } from "lucide-react";
import { getCategoryOfPost, getPost, getPostSlugs, getNeighbours, slugify, coverPositionStyle } from "@/lib/posts";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { site } from "@/config/site";
import { Reveal } from "@/components/effects/Reveal";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { OutdatedNotice } from "@/components/blog/OutdatedNotice";
import { SeriesCard } from "@/components/blog/SeriesCard";
import { CodeCopy } from "@/components/blog/CodeCopy";
import { ReadDoneCorner } from "@/components/blog/ReadDoneCorner";
import { getSeries, linkSeriesRefs } from "@/lib/series";
import { HOME_OG_IMAGE, ogImageFor, ogImages } from "@/lib/og";
export function generateStaticParams(){return getPostSlugs().map(slug=>({slug}))}
export async function generateMetadata({params}:PageProps<"/blog/[slug]">):Promise<Metadata>{
  const {slug}=await params;const post=getPost(slug);
  if(!post)return {title:"没有找到这篇手记"};
  const url=`/blog/${post.slug}/`;
  /* 分享图：知识图谱系列每篇有自己的卡片（public/og/<slug>.png），其余文章用自己的封面，没有封面才用首页图 */
  const series=getSeries(post.slug);
  const alt=series?`${series.name} · 第 ${series.index}/${series.total} 篇 · ${post.title}`:post.title;
  /* 系列卡优先；否则用文章封面（和以前一样）；都没有才回退首页图 */
  const card=ogImageFor(post.slug);
  const image=card!==HOME_OG_IMAGE?card:post.cover||HOME_OG_IMAGE;
  const ogImageList=image===post.cover?[{url:image,alt:post.title}]:ogImages(image,alt);
  return {title:post.title,description:post.description,alternates:{canonical:url},keywords:post.tags,openGraph:{type:"article",title:post.title,description:post.description,url,publishedTime:post.date,modifiedTime:post.updated||post.date,tags:post.tags,images:ogImageList},twitter:{card:"summary_large_image",title:post.title,description:post.description,images:[image]}};
}
export default async function PostPage({params}:PageProps<"/blog/[slug]">){
  const {slug}=await params;const post=getPost(slug);
  if(!post)notFound();
  const series=getSeries(post.slug);
  const rendered=await renderMarkdown(post.content);
  const html=series?linkSeriesRefs(rendered,series):rendered;
  const headings=extractHeadings(html);
  const neighbours=getNeighbours(post.slug);
  // 系列文章的上一篇 / 下一篇按系列顺序走，不按全站日期
  const previous=series?(series.previous&&getPost(series.previous.slug)):neighbours.previous;
  const next=series?(series.next&&getPost(series.next.slug)):neighbours.next;
  const category=getCategoryOfPost(post.slug);
  const jsonLd={"@context":"https://schema.org","@type":"BlogPosting",headline:post.title,description:post.description,datePublished:post.date,dateModified:post.updated||post.date,keywords:post.tags.join(","),image:post.cover?`${site.url}${post.cover}`:undefined,url:`${site.url}/blog/${post.slug}/`,author:{"@type":"Person",name:site.nickname},publisher:{"@type":"Organization",name:site.name}};
  return <main id="main" className="container inner">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <ReadingProgress/>
    <Reveal className="reading-head">
      <Link className="back-link" href="/blog/" data-pagefind-ignore="all"><ArrowLeft size={15}/>所有手记</Link>
      <div className="post-meta">{post.tags.map(t=>t.toUpperCase()).join(" / ")}<span>{post.date.replaceAll("-",".")}</span></div>
      <h1>{post.title}</h1>
      <p className="reading-lede">{post.description}</p>
      <div className="reading-facts" data-pagefind-ignore="all">
        <span><CalendarDays size={14}/>{post.date.replaceAll("-",".")}</span>
        {post.updated&&post.updated!==post.date&&<span className="ft-updated-chip"><RefreshCw size={14}/>更新于 <b>{post.updated.replaceAll("-",".")}</b></span>}
        <span><Clock size={14}/>约 {post.readingTime} 分钟</span>
        {category&&<span><Folder size={14}/><Link href={`/categories/${category.slug}/`}>{category.name}</Link></span>}
      </div>
      <div className="reading-tags" aria-label="标签">
        {post.tags.map(tag=><Link key={tag} className="tag-chip" href={`/tags/${slugify(tag)}/`}># {tag}</Link>)}
      </div>
      {series&&<SeriesCard series={series}/>}
    </Reveal>
    {post.cover&&!post.hideCover&&<Reveal className="reading-cover" style={coverPositionStyle(post.coverPosition)}><Image src={post.cover} alt="" fill sizes="(max-width: 900px) 100vw, 1040px" loading="eager"/></Reveal>}
    <div className="reading-layout">
      <div className="ft-article-col">
        <OutdatedNotice date={post.date} updated={post.updated} seriesHref={category?`/categories/${category.slug}/`:undefined}/>
        <article className="prose" dangerouslySetInnerHTML={{__html:html}}/>
        <CodeCopy/>
        <ReadDoneCorner/>
      </div>
      <aside className="reading-aside" data-pagefind-ignore="all">
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
    <nav className="post-pager" aria-label={series?`${series.name}系列内相邻手记`:"相邻手记"} data-pagefind-ignore="all">
      {previous?<Link href={`/blog/${previous.slug}/`}><ArrowLeft size={16}/><span><small>{series&&series.previous&&<i className="ft-pager-series">{series.name} · 第 {series.previous.index}/{series.total} 篇</i>}上一篇</small>{previous.title}</span></Link>:<span/>}
      {next?<Link href={`/blog/${next.slug}/`} className="pager-next"><span><small>{series&&series.next&&<i className="ft-pager-series">{series.name} · 第 {series.next.index}/{series.total} 篇</i>}下一篇</small>{next.title}</span><ArrowRight size={16}/></Link>:<span/>}
    </nav>
  </main>;
}
