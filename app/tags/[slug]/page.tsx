import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft,ArrowUpRight } from "lucide-react";
import { getPostsByTag, getTagSummaries } from "@/lib/posts";
import { PostRow } from "@/components/blog/PostRow";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export function generateStaticParams(){return getTagSummaries().map(tag=>({slug:tag.slug}))}
export async function generateMetadata({params}:PageProps<"/tags/[slug]">):Promise<Metadata>{
  const {slug}=await params;const tag=getTagSummaries().find(item=>item.slug===slug);
  if(!tag)return {title:"没有找到这个标签"};
  return {title:`标签 · ${tag.name}`,description:`带有「${tag.name}」标签的 ${tag.count} 篇手记。`,alternates:{canonical:`/tags/${tag.slug}/`}};
}
export default async function TagPage({params}:PageProps<"/tags/[slug]">){
  const {slug}=await params;const tag=getTagSummaries().find(item=>item.slug===slug);
  if(!tag)notFound();
  const posts=getPostsByTag(slug);
  const others=getTagSummaries().filter(item=>item.slug!==slug).slice(0,10);
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <Link className="back-link" href="/tags/"><ArrowLeft size={15}/>所有标签</Link>
      <span className="page-eyebrow" style={{marginTop:"22px"}}><i/>TAGGED / 标签</span>
      <h1># {tag.name}<span>，{tag.count} 篇</span></h1>
      <p>带有这个标签的全部手记。最近一次出现在 {tag.latest.replaceAll("-",".")}。</p>
    </Reveal>
    <Reveal as="section" className="home-section">
      <PostRow posts={posts}/>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>相关标签</h2><span className="eyebrow">NEARBY TAGS</span></div></div>
      <div className="tag-row">
        {others.map(item=><Link key={item.slug} className="tag-chip" href={`/tags/${item.slug}/`}># {item.name} <span>{item.count}</span></Link>)}
        <Link className="tag-chip" href="/categories/">按分类浏览<ArrowUpRight size={12}/></Link>
      </div>
    </Reveal>
    <SideRail current="tags"/>
  </main>;
}
