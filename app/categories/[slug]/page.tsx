import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft,ArrowUpRight } from "lucide-react";
import { getCategories } from "@/lib/posts";
import { PostRow } from "@/components/blog/PostRow";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export function generateStaticParams(){return getCategories().map(category=>({slug:category.slug}))}
export async function generateMetadata({params}:PageProps<"/categories/[slug]">):Promise<Metadata>{
  const {slug}=await params;const category=getCategories().find(item=>item.slug===slug);
  if(!category)return {title:"没有找到这个分类"};
  return {title:`分类 · ${category.name}`,description:`${category.name} 分类下的 ${category.count} 篇手记。`,alternates:{canonical:`/categories/${category.slug}/`}};
}
export default async function CategoryPage({params}:PageProps<"/categories/[slug]">){
  const {slug}=await params;const category=getCategories().find(item=>item.slug===slug);
  if(!category)notFound();
  const others=getCategories().filter(item=>item.slug!==slug);
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <Link className="back-link" href="/categories/"><ArrowLeft size={15}/>所有分类</Link>
      <span className="page-eyebrow" style={{marginTop:"22px"}}><i/>CATEGORY / 分类</span>
      <h1>{category.name}<span>，{category.count} 篇</span></h1>
      <p>这个分类下的全部手记，按时间从新到旧排列。最近更新于 {category.latest.replaceAll("-",".")}。</p>
    </Reveal>
    <Reveal as="section" className="home-section">
      <PostRow posts={category.posts}/>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>换个分类</h2><span className="eyebrow">KEEP BROWSING</span></div></div>
      <div className="tag-row">
        {others.map(item=><Link key={item.slug} className="tag-chip" href={`/categories/${item.slug}/`}>{item.name} <span>{item.count}</span></Link>)}
        <Link className="tag-chip" href="/tags/">按标签浏览<ArrowUpRight size={12}/></Link>
      </div>
    </Reveal>
    <SideRail current="categories"/>
  </main>;
}
