import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight,Folder } from "lucide-react";
import { getCategories, getPosts } from "@/lib/posts";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export const metadata: Metadata = {
  title: "分类",
  description: "按主题浏览汐间的手记：设计、技术、AI 与生活。",
  alternates: { canonical: "/categories/" },
};
export default function CategoriesPage(){
  const categories=getCategories();
  const posts=getPosts();
  const largest=Math.max(...categories.map(category=>category.count));
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <span className="page-eyebrow"><i/>CATEGORIES / 分类</span>
      <h1>按主题，<span>慢慢翻。</span></h1>
      <p>每一篇手记都会落进一个分类。分类少而稳，标签多而活——想找同一条线索，两条路都在。</p>
      <div className="page-stats">
        <span><b>{categories.length}</b> 个分类</span>
        <span><b>{posts.length}</b> 篇手记</span>
        <span>最大分类 <b>{largest}</b> 篇</span>
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>全部分类</h2><span className="eyebrow">ALL CATEGORIES</span></div><Link href="/tags/" className="text-link">按标签浏览<ArrowUpRight size={15}/></Link></div>
      <div className="taxonomy-grid">
        {categories.map(category=><Link key={category.slug} href={`/categories/${category.slug}/`} className="taxonomy-card">
          <span className="taxonomy-icon"><Folder size={15}/></span>
          <div>
            <h3>{category.name}</h3>
            <p>{category.count} 篇 · 最近 {category.latest.replaceAll("-",".")}</p>
          </div>
          <span className="taxonomy-bar" style={{width:`${Math.round((category.count/largest)*100)}%`}} aria-hidden="true"/>
          <ArrowUpRight size={16}/>
        </Link>)}
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">02</span><h2>最新手记</h2><span className="eyebrow">RECENT</span></div><Link href="/archive/" className="text-link">完整归档<ArrowUpRight size={15}/></Link></div>
      <ol className="archive-list">
        {posts.slice(0,4).map((post,index)=><li key={post.slug}>
          <Link href={`/blog/${post.slug}/`}>
            <span className="archive-index">{String(index+1).padStart(2,"0")}</span>
            <time dateTime={post.date}>{post.date.replaceAll("-",".")}</time>
            <span className="archive-title">{post.title}</span>
            <span className="archive-tags">{post.tags.join(" · ")}</span>
            <span className="archive-time">{post.readingTime} min</span>
            <ArrowUpRight size={16}/>
          </Link>
        </li>)}
      </ol>
    </Reveal>
    <SideRail current="categories"/>
  </main>;
}
