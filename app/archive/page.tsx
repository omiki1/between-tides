import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight,CalendarDays,ChevronDown } from "lucide-react";
import { getArchive, getCategories, getPosts } from "@/lib/posts";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
import { CategoryBar } from "@/components/blog/CategoryBar";
export const metadata: Metadata = {
  title: "归档",
  description: "汐间的全部手记，按年份排列，可折叠查看。",
  alternates: { canonical: "/archive/" },
};
export default function ArchivePage(){
  const archive=getArchive();
  const posts=getPosts();
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <span className="page-eyebrow"><i/>ARCHIVE / 归档</span>
      <h1>时间把文字，<span>排成了一列。</span></h1>
      <p>按年份列出所有手记。非最新年份默认折叠，展开后可按月份查看。想按主题找可以去分类，顺着线索找可以去标签。</p>
      <div className="page-stats">
        <span><b>{posts.length}</b> 篇手记</span>
        <span><b>{archive.length}</b> 个年份</span>
        <span>首次记录 <b>{posts[posts.length-1].date.replaceAll("-",".")}</b></span>
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>按年份</h2><span className="eyebrow">BY YEAR</span></div><Link href="/categories/" className="text-link">按分类浏览<ArrowUpRight size={15}/></Link></div>
      <CategoryBar/>
      <div className="archive-years">
        {archive.map((group,index)=>{
          const rows=<ol className="archive-list">
            {group.posts.map((post,position)=><li key={post.slug}>
              <Link href={`/blog/${post.slug}/`}>
                <span className="archive-index">{String(position+1).padStart(2,"0")}</span>
                <time dateTime={post.date}>{post.date.slice(5).replaceAll("-",".")}</time>
                <span className="archive-title">{post.title}</span>
                <span className="archive-tags">{post.tags.join(" · ")}</span>
                <span className="archive-time">{post.readingTime} min</span>
                <ArrowUpRight size={16}/>
              </Link>
            </li>)}
          </ol>;
          const header=<span className="archive-year-head">
            <span className="archive-year-number">{group.year}</span>
            <span className="archive-year-line" aria-hidden="true"/>
            <span className="archive-year-count"><CalendarDays size={13}/>{group.count} 篇</span>
            {index>0&&<ChevronDown className="archive-year-chevron" size={15}/>}
          </span>;
          /* 最新年份直接展开，其余年份折叠，减少长页面滚动。 */
          return index===0
            ? <section key={group.year} className="archive-year">{header}{rows}</section>
            : <details key={group.year} className="archive-year"><summary>{header}</summary>{rows}</details>;
        })}
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">02</span><h2>其他入口</h2><span className="eyebrow">MORE WAYS IN</span></div></div>
      <div className="start-grid">
        <Link href="/blog/">全部手记<ArrowUpRight size={15}/></Link>
        <Link href="/categories/">按分类浏览<ArrowUpRight size={15}/></Link>
        <Link href="/tags/">按标签浏览<ArrowUpRight size={15}/></Link>
        <Link href="/rss.xml">订阅 RSS<ArrowUpRight size={15}/></Link>
      </div>
      <p className="method-note">共 {getCategories().length} 个分类、{posts.length} 篇手记。分类与标签都从文章 frontmatter 推导，新增文章会自动出现在这里。</p>
    </Reveal>
    <SideRail current="archive"/>
  </main>;
}