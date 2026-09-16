import type { MetadataRoute } from "next";
import { getCategories, getPosts, getTagSummaries } from "@/lib/posts";
import { albums } from "@/data/gallery";
import { projects } from "@/data/projects";
import { site } from "@/config/site";
const absolute = (path:string) => `${site.url.replace(/\/$/,"")}${path}`;
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap{
  const posts=getPosts();
  const newest=posts[0]?.date?new Date(`${posts[0].date}T09:00:00+08:00`):new Date();
  const pages:MetadataRoute.Sitemap=[
    {url:absolute("/"),lastModified:newest,changeFrequency:"weekly",priority:1},
    {url:absolute("/blog/"),lastModified:newest,changeFrequency:"weekly",priority:.9},
    {url:absolute("/projects/"),lastModified:newest,changeFrequency:"monthly",priority:.8},
    {url:absolute("/gallery/"),lastModified:newest,changeFrequency:"monthly",priority:.7},
    {url:absolute("/anime/"),lastModified:newest,changeFrequency:"weekly",priority:.7},
    {url:absolute("/notes/"),lastModified:newest,changeFrequency:"weekly",priority:.7},
    {url:absolute("/about/"),lastModified:newest,changeFrequency:"yearly",priority:.6},
    {url:absolute("/categories/"),lastModified:newest,changeFrequency:"weekly",priority:.7},
    {url:absolute("/tags/"),lastModified:newest,changeFrequency:"weekly",priority:.7},
    {url:absolute("/archive/"),lastModified:newest,changeFrequency:"weekly",priority:.7},
  ];
  const taxonomy:MetadataRoute.Sitemap=[
    ...getCategories().map(category=>({url:absolute(`/categories/${category.slug}/`),lastModified:new Date(`${category.latest}T09:00:00+08:00`),changeFrequency:"weekly" as const,priority:.6})),
    ...getTagSummaries().map(tag=>({url:absolute(`/tags/${tag.slug}/`),lastModified:new Date(`${tag.latest}T09:00:00+08:00`),changeFrequency:"weekly" as const,priority:.5})),
    ...albums.map(album=>({url:absolute(`/gallery/${album.slug}/`),lastModified:newest,changeFrequency:"monthly" as const,priority:.6})),
    ...projects.map(project=>({url:absolute(`/projects/${project.id}/`),lastModified:newest,changeFrequency:"monthly" as const,priority:.7})),
  ];
  return [...pages,...taxonomy,...posts.map(post=>({url:absolute(`/blog/${post.slug}/`),lastModified:new Date(`${post.updated||post.date}T09:00:00+08:00`),changeFrequency:"monthly" as const,priority:.8}))];
}