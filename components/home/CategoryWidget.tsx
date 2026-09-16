import Link from "next/link";
import { getCategories } from "@/lib/posts";

export function CategoryWidget() {
  const categories = getCategories();
  return (
    <article className="widget-card">
      <div className="widget-head">
        <span className="eyebrow">分类</span>
        <Link href="/categories/" className="text-link">
          全部
        </Link>
      </div>
      <ul className="widget-list">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={`/categories/${category.slug}/`}>
              <span>{category.name}</span>
              <b>{category.count}</b>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
