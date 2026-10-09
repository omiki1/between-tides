import Link from "next/link";
import type { Series } from "@/lib/series";
/**
 * 系列进度卡：9 个泡泡，已读的实心、当前的发光、未读的空心。
 * 卡片本身是服务端组件（静态 HTML，不参与水合）；「已读」状态存在本机 localStorage，
 * 由 SeriesProgress 小岛在页面加载完、空闲后读出来，直接给 li 加 .read、填好「已读 N」那行。
 */
export function SeriesCard({series}:{series:Series}){
  const current=series.items[series.index-1];
  return <section className="ft-series" aria-label={`${series.name}系列导航`} data-pagefind-ignore="all" data-series={series.key} data-current={current.slug}>
    <div className="ft-series-top">
      <small>SERIES · {series.name}</small>
      <strong>第 {series.index}/{series.total} 篇<em data-series-read hidden/></strong>
    </div>
    <ol className="ft-series-steps">
      {series.items.map(item=>{
        const isCurrent=item.slug===current.slug;
        const label=`第 ${item.index}/${series.total} 篇 · ${item.title}`;
        return <li key={item.slug} className={isCurrent?"current":undefined} data-slug={item.slug} data-minutes={item.readingTime}>
          {isCurrent
            ?<span aria-current="page" data-tip={label} tabIndex={0}><i className="ft-bubble"/><span className="ft-sr-only">{label}（本篇）</span></span>
            :<Link href={`/blog/${item.slug}/`} prefetch={false} data-tip={label} aria-label={label}><i className="ft-bubble"/></Link>}
        </li>;
      })}
    </ol>
    <div className="ft-series-foot">
      {series.previous?<Link href={`/blog/${series.previous.slug}/`} prefetch={false}>← 第 {series.previous.index}/{series.total} 篇<span className="t"> · {series.previous.title}</span></Link>:<span/>}
      <Link href={series.href} prefetch={false}>整个系列</Link>
      {series.next?<Link href={`/blog/${series.next.slug}/`} prefetch={false}>第 {series.next.index}/{series.total} 篇<span className="t"> · {series.next.title}</span> →</Link>:<span/>}
    </div>
  </section>;
}
