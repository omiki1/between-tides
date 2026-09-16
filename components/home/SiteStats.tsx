import { getPosts } from "@/lib/posts";
import { gallery } from "@/data/gallery";
import { projects } from "@/data/projects";
import { getBangumiStats } from "@/lib/bangumi";
import { VisitorStat } from "./VisitorStat";

export function SiteStats() {
  const stats = [
    { label: "手记", value: getPosts().length },
    { label: "项目", value: projects.length },
    { label: "画面", value: gallery.length },
    { label: "追番", value: getBangumiStats().total },
  ];
  return (
    <article className="widget-card">
      <span className="eyebrow">站点速记</span>
      <dl className="stat-grid">
        {stats.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
        <VisitorStat />
      </dl>
    </article>
  );
}
