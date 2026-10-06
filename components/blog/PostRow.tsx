import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/posts";
import { EmptyState } from "@/components/ui/EmptyState";
export function PostRow({posts,empty}:{posts:Post[];empty?:React.ReactNode}){
  if(!posts.length)return <EmptyState line="这里暂时还没有手记呢。" hint={empty??<>先去 <Link href="/blog/">全部手记</Link> 里逛逛吧。</>}/>;
  return <ol className="post-table">
    {posts.map((post,index)=><li key={post.slug}>
      <Link href={`/blog/${post.slug}/`}>
        <span className="post-table-index">{String(index+1).padStart(2,"0")}</span>
        <span className="post-table-body">
          <span className="post-table-meta">
            <time dateTime={post.date}>{post.date.replaceAll("-",".")}</time>
            <span>{post.tags.join(" · ")}</span>
            <span>{post.readingTime} min</span>
          </span>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </span>
        <span className="post-table-arrow"><ArrowUpRight size={16}/></span>
      </Link>
    </li>)}
  </ol>;
}
