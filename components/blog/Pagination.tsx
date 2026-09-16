import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function Pagination({current,total,base="/blog"}:{current:number;total:number;base?:string}){
  if(total<=1)return null;
  const href=(page:number)=>page<=1?`${base}/`:`${base}/page/${page}/`;
  const pages=Array.from({length:total},(_,index)=>index+1);
  return <nav className="pagination" aria-label="分页">
    {current>1?<Link className="pagination-step" href={href(current-1)} rel="prev">上一页</Link>:<span className="pagination-step disabled">上一页</span>}
    <ol>
      {pages.map(page=><li key={page}>
        {page===current?<span className="pagination-current" aria-current="page">{page}</span>:<Link href={href(page)}>{page}</Link>}
      </li>)}
    </ol>
    {current<total?<Link className="pagination-step" href={href(current+1)} rel="next">下一页<ArrowUpRight size={14}/></Link>:<span className="pagination-step disabled">下一页</span>}
  </nav>;
}
