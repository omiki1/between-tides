import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight,Tag as TagIcon } from "lucide-react";
import { getPosts, getTagSummaries } from "@/lib/posts";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export const metadata: Metadata = {
  title: "标签",
  description: "汐间的全部标签：从设计、AI 到生活方式。",
  alternates: { canonical: "/tags/" },
};
export default function TagsPage(){
  const tags=getTagSummaries();
  const posts=getPosts();
  const heaviest=Math.max(...tags.map(tag=>tag.count));
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <span className="page-eyebrow"><i/>TAGS / 标签</span>
      <h1>顺着标签，<span>找同一条线索。</span></h1>
      <p>分类决定文章住在哪一间屋子，标签则标记它路过的地方。字数越大，说明那条线索出现得越多。</p>
      <div className="page-stats">
        <span><b>{tags.length}</b> 个标签</span>
        <span><b>{posts.length}</b> 篇手记</span>
        <span>出现最多 <b>{heaviest}</b> 次</span>
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>标签云</h2><span className="eyebrow">TAG CLOUD</span></div><Link href="/categories/" className="text-link">按分类浏览<ArrowUpRight size={15}/></Link></div>
      <div className="tag-cloud">
        {tags.map(tag=><Link key={tag.slug} href={`/tags/${tag.slug}/`} className={`tag-cloud-item weight-${Math.min(3,tag.count)}`}>
          <span className="tag-cloud-mark">#</span>{tag.name}
          <small>{tag.count}</small>
        </Link>)}
      </div>
    </Reveal>
    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">02</span><h2>标签清单</h2><span className="eyebrow">INDEX</span></div></div>
      <ul className="tag-index">
        {tags.map(tag=><li key={tag.slug}>
          <Link href={`/tags/${tag.slug}/`}>
            <TagIcon size={13}/>
            <span className="tag-index-name">{tag.name}</span>
            <span className="tag-index-count">{tag.count} 篇</span>
            <time dateTime={tag.latest}>{tag.latest.replaceAll("-",".")}</time>
            <ArrowUpRight size={14}/>
          </Link>
        </li>)}
      </ul>
    </Reveal>
    <SideRail current="tags"/>
  </main>;
}
