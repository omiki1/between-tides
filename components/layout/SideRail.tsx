import { site } from "@/config/site";
/** Right-edge section rail for inner pages: same navigation, fewer pixels. */
export function SideRail({current}:{current:string}){
  return <nav className="side-rail" aria-label="区块导航">
    <span className="side-rail-line" aria-hidden="true"/>
    {site.nav.map((item,index)=>{
      const key = item.href.replaceAll("/","") || "home";
      const active = key === current;
      return <a key={item.href} href={item.href} className={active?"active":undefined} aria-current={active?"page":undefined}>
        <i>{String(index+1).padStart(2,"0")}</i>
        <span>{item.label}</span>
      </a>;
    })}
  </nav>;
}
