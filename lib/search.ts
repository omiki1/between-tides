import { getCategories, getPosts, getTagSummaries } from "@/lib/posts";
import { getNotes } from "@/lib/notes";
import { projects } from "@/data/projects";
import { albums, gallery } from "@/data/gallery";
import { site } from "@/config/site";
import { getBangumi } from "@/lib/bangumi";
export type SearchEntry = { title:string; href:string; kind:string; excerpt:string; keywords:string };

/** One flat index built from the same content sources the pages render. */
export function getSearchIndex(): SearchEntry[] {
  const pages = site.nav
    .filter(n=>n.href!=="/")
    .map(n=>({ title:n.label, href:n.href, kind:"页面", excerpt:`${site.name} · ${n.label}`, keywords:n.label.toLowerCase() }));
  const taxonomyEntries = [
    ...getCategories().map(c=>({ title:`分类 · ${c.name}`, href:`/categories/${c.slug}/`, kind:"分类", excerpt:`${c.count} 篇手记`, keywords:[c.name,c.slug,...c.posts.map(p=>p.title)].join(" ") })),
    ...getTagSummaries().map(t=>({ title:`标签 · ${t.name}`, href:`/tags/${t.slug}/`, kind:"标签", excerpt:`${t.count} 篇手记`, keywords:[t.name,t.slug].join(" ") })),
  ];
  const posts = getPosts().map(p=>({
    title:p.title, href:`/blog/${p.slug}/`, kind:"文章",
    excerpt:p.description || p.content.replace(/[#>*`\-\[\]!]|\s+/g," ").slice(0,90).trim(),
    keywords:[p.title,p.description,p.tags.join(" "),p.content.replace(/[#>*`]/g," ")].join(" "),
  }));
  const projectEntries = projects.map(p=>({
    title:p.name, href:`/projects/${p.id}/`, kind:"项目",
    excerpt:`${p.subtitle} ${p.description}`,
    keywords:[p.name,p.subtitle,p.description,p.tags.join(" "),p.status,p.github??""].join(" "),
  }));
  const galleryEntries = [
    ...albums.map(album=>({ title:`相册 · ${album.title}`, href:`/gallery/${album.slug}/`, kind:"图集", excerpt:album.description, keywords:`相册 ${album.title} ${album.english} 风景壁纸 达妮娅 Denia` })),
    ...gallery.map(p=>({ title:`相册 · ${p.title}`, href:`/gallery/${p.album}/#${p.id}`, kind:"图集", excerpt:p.location, keywords:`相册 图片 ${p.title} ${p.english} ${p.location}` })),
  ];
  const animeEntries = getBangumi().slice(0, 80).map(item=>({
    title:item.title, href:"/anime/", kind:"追番",
    excerpt:`${item.seasonTypeName} · ${item.epStatus || "追番"}`,
    keywords:[item.title,item.seasonTypeName,item.evaluate].join(" "),
  }));
  const noteEntries = getNotes().map(n=>({
    title:n.text.slice(0,26), href:`/notes/#${n.id}`, kind:"随记",
    excerpt:n.text, keywords:[n.text,n.tags.join(" "),n.date].join(" "),
  }));
  return [...pages,...taxonomyEntries,...posts,...projectEntries,...galleryEntries,...animeEntries,...noteEntries].map(e=>({...e,keywords:e.keywords.toLowerCase()}));
}
