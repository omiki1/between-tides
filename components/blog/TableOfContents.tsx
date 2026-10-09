import type { Heading } from "@/lib/markdown";
/** 本页目录：服务端组件。当前小节的高亮由 TocObserver 小岛在空闲后接管（直接改 aria-current）。 */
export function TableOfContents({headings}:{headings:Heading[]}){
  if(!headings.length)return null;
  return <nav className="toc" aria-label="本页目录">
    <span className="eyebrow">ON THIS PAGE</span>
    <ol>{headings.map(heading=><li key={heading.id} className={heading.depth===3?"depth-3":undefined}>
      <a href={`#${heading.id}`}>{heading.text}</a>
    </li>)}</ol>
  </nav>;
}
