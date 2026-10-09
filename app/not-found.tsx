import Link from "next/link";
import type { Metadata } from "next";
import { Compass,ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { getPosts } from "@/lib/posts";
import { BubbleStage } from "@/components/effects/BubbleStage";
import { CharacterArt } from "@/components/ui/CharacterArt";
export const metadata:Metadata={title:"找不到这个页面",description:"这个地址没有对应的内容。"};
export default function NotFound(){
  const posts=getPosts().map(p=>({title:p.title,href:`/blog/${p.slug}/`}));
  return <main id="main" className="container inner" data-pagefind-ignore="all">
    <div className="ft-404">
      <section className="page-head not-found">
        <span className="page-eyebrow"><i/>404 / NOT FOUND</span>
        <h1>这条潮汐，<span>没有带回什么。</span></h1>
        <p>可能是链接写错了，也可能是这一页还没有被写出来。往下走几步，通常能回到岸上。</p>
        <div className="notfound-links">
          {site.nav.map(item=><Link key={item.href} href={item.href}>{item.href==="/"?<><Compass size={15}/>回到首页</>:item.label}<ArrowUpRight size={14}/></Link>)}
        </div>
        <CharacterArt name="denia-04" variant="inline" className="char-art--start char-art--badge" sizes="(max-width: 700px) 132px, 176px"/>
      </section>
      <BubbleStage posts={posts}/>
    </div>
  </main>;
}
