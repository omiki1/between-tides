import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategories } from "@/lib/posts";
/** 分类快捷导航：出现在手记列表与归档页顶部（参考站称之为 categoryBar）。 */
export function CategoryBar({active}:{active?:string}){
  const categories=getCategories();
  if(!categories.length)return null;
  return <nav className="category-bar" aria-label="分类快捷导航">
    <span className="category-bar-label">分类</span>
    {categories.map(category=><Link key={category.slug} href={`/categories/${category.slug}/`} className={category.slug===active?"active":undefined} aria-current={category.slug===active?"page":undefined}>
      {category.name}<span>{category.count}</span>
    </Link>)}
    <Link className="category-bar-more" href="/categories/">全部<ArrowUpRight size={12}/></Link>
  </nav>;
}
