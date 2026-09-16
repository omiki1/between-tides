import { getPosts } from "@/lib/posts";
import { site } from "@/config/site";
export const dynamic = "force-static";
const escape = (value:string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const absolute = (path:string) => `${site.url.replace(/\/$/,"")}${path}`;
export function GET(){
  const posts=getPosts();
  const updated=posts[0]?.date??"2026-09-15";
  const items=posts.map(post=>[
    "    <item>",
    `      <title>${escape(post.title)}</title>`,
    `      <link>${absolute(`/blog/${post.slug}/`)}</link>`,
    `      <guid isPermaLink="true">${absolute(`/blog/${post.slug}/`)}</guid>`,
    `      <pubDate>${new Date(`${post.date}T09:00:00+08:00`).toUTCString()}</pubDate>`,
    `      <description>${escape(post.description)}</description>`,
    `      <category>${escape(post.tags.join("/"))}</category>`,
    "    </item>",
  ].join("\n")).join("\n");
  const xml=[
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escape(site.name)} — ${escape(site.nickname)} 的数字花园</title>`,
    `    <link>${absolute("/")}</link>`,
    `    <description>${escape(site.description)}</description>`,
    "    <language>zh-CN</language>",
    `    <lastBuildDate>${new Date(`${updated}T09:00:00+08:00`).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${absolute("/rss.xml")}" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  return new Response(xml,{headers:{"Content-Type":"application/rss+xml; charset=utf-8"}});
}
