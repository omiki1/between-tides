import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getPage, getTagSummaries, getTotalPages, coverPositionStyle } from "@/lib/posts";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
import { CategoryBar } from "@/components/blog/CategoryBar";
import { PostRow } from "@/components/blog/PostRow";
export const metadata: Metadata = {
  title: "手记",
  description: "全部手记：设计、技术、AI 与生活。按时间倒序，每页 12 篇。",
  alternates: { canonical: "/blog/" },
};
const english = (value:string) => value.toUpperCase();
export default function BlogPage(){
  const posts = getPage(1);
  const [featured, ...rest] = posts;
  const tags = getTagSummaries();
  const total = getTotalPages();
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <span className="page-eyebrow"><i/>THE JOURNAL / 手记</span>
      <h1>每一篇，<span>都是一次停留。</span></h1>
      <p>这里放没有标准答案的思考：界面为什么这样做、代码能不能更简单、以及偶尔跑神时想到的事。</p>
      <div className="page-stats">
        <span><b>{posts.length}</b> 篇手记</span>
        <span><b>{tags.length}</b> 个标签</span>
        <span>{total>1?<>共 <b>{total}</b> 页</>:<>最近更新 <b>{featured.date.replaceAll("-",".")}</b></>}</span>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>最新</h2><span className="eyebrow">LATEST</span></div><Link href="/archive/" className="text-link">按年份归档<ArrowUpRight size={15}/></Link></div>
      <div className="journal-grid">
        <Link href={`/blog/${featured.slug}/`} className="featured-post" style={coverPositionStyle(featured.coverPosition)}>
          <Image src={featured.cover} alt="" fill sizes="(max-width: 700px) 100vw, 60vw" preload/>
          <div className="featured-shade"/>
          <span className="featured-tag">精选手记 <span>FEATURED</span></span>
          <div className="featured-post-text">
            <div className="post-meta">{featured.tags.map(english).join(" / ")}<span>{featured.date.replaceAll("-",".")} · {featured.readingTime} MIN READ</span></div>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
          </div>
          <ArrowUpRight className="feature-arrow" size={22}/>
        </Link>
        <div className="post-side">
          {rest.slice(0,2).map((post,index)=><Link href={`/blog/${post.slug}/`} className="small-post" key={post.slug}>
            <div className="post-meta"><span>{post.tags.map(english).join(" / ")}</span><span>0{index+2}</span></div>
            <h3>{post.title}<ArrowUpRight size={17}/></h3>
            <p>{post.description}</p>
            <span className="post-date">{post.date.replaceAll("-",".")} <i/> {post.readingTime} min read</span>
          </Link>)}
        </div>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">02</span><h2>全部手记</h2><span className="eyebrow">ARCHIVE</span></div><Link href="/tags/" className="text-link">全部标签<ArrowUpRight size={15}/></Link></div>
      <CategoryBar/>
      <PostRow posts={posts}/>
    </Reveal>
    <SideRail current="blog"/>
  </main>;
}
