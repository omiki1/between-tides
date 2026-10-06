import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { PointerEffects } from "@/components/effects/PointerEffects";
import { DeniaBubbles } from "@/components/effects/DeniaBubbles";
import { Sakura } from "@/components/effects/Sakura";
import { MusicDock } from "@/components/layout/MusicDock";
import { VisitRecorder } from "@/components/layout/VisitRecorder";
import { SearchDialog, type SearchSeed } from "@/components/search/SearchDialog";
import { DeniaDetails } from "@/components/effects/DeniaDetails";
import { getCategories, getPosts, getTagSummaries } from "@/lib/posts";
import { ReadingProgress } from "@/components/effects/ReadingProgress";
import { WelcomeToast } from "@/components/effects/WelcomeToast";
import "./globals.css";
import "../styles/features.css";
import "@/styles/texture.css";
import "@/styles/denia.css";
import "@/styles/a11y.css";
import "@/styles/perf.css";
const manrope=localFont({src:"../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",variable:"--font-manrope",display:"swap"});
export const metadata:Metadata={metadataBase:new URL(site.url),title:{default:site.seo.title,template:`%s · ${site.name}`},description:site.description,keywords:site.seo.keywords,openGraph:{title:site.seo.title,description:site.description,type:"website",locale:"zh_CN",siteName:site.name},twitter:{card:"summary",title:site.seo.title,description:site.description},icons:{icon:[{url:"/denia-favicon.svg",type:"image/svg+xml"}],other:[{rel:"alternate icon",url:"/favicon.svg",type:"image/svg+xml"}]},alternates:{types:{"application/rss+xml":"/rss.xml"}}};
export const viewport:Viewport={themeColor:[{media:"(prefers-color-scheme: dark)",color:"#110e1e"},{media:"(prefers-color-scheme: light)",color:"#f7f3f8"}],colorScheme:"dark light"};
const fontBoot=`(function(){try{var m=localStorage.getItem("firefly-font-mode");document.documentElement.dataset.fontMode=m==="original"?"original":"wenkai"}catch(e){}})()`;
const introBoot=`(function(){try{var p=location.pathname.replace(/\\/+$/,"")||"/";if(p!=="/")return;if(/[?&]intro=1(?:&|$)/.test(location.search))sessionStorage.removeItem("between-tides.home-intro-seen.v2");var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduced||sessionStorage.getItem("between-tides.home-intro-seen.v2")==="1"){document.documentElement.dataset.intro="seen"}else{document.documentElement.dataset.intro="boot"}}catch(e){}})()`;
/** Cmd+K 打开时、还没输入前显示的内容，以及搜不到时的推荐词。构建时算好，随页面一起下发。 */
function searchSeed():SearchSeed{
  const recent=getPosts().slice(0,5).map(p=>({title:p.title,href:`/blog/${p.slug}/`,excerpt:p.description}));
  const names=new Set<string>();
  const suggestions:SearchSeed["suggestions"]=[];
  for(const c of getCategories().slice(0,3)){names.add(c.name.toLowerCase());suggestions.push({label:`${c.name} · ${c.count} 篇`,href:`/categories/${c.slug}/`,query:c.name})}
  for(const t of getTagSummaries()){if(suggestions.length>=5)break;if(names.has(t.name.toLowerCase()))continue;names.add(t.name.toLowerCase());suggestions.push({label:t.name,href:`/tags/${t.slug}/`,query:t.name})}
  suggestions.push({label:"按时间浏览",href:"/archive/"});
  return {recent,suggestions};
}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN" data-scroll-behavior="smooth" data-font-mode="wenkai" suppressHydrationWarning><body className={manrope.variable}><script dangerouslySetInnerHTML={{__html:fontBoot}}/><script dangerouslySetInnerHTML={{__html:introBoot}}/><Providers><a className="skip-link" href="#main">跳到主要内容</a><AmbientBackground/><Sakura/><PointerEffects/><DeniaBubbles/><ReadingProgress/><Navbar/><WelcomeToast/><div className="ft-pf-body" data-pagefind-body>{children}</div><MusicDock/><Footer/><SearchDialog seed={searchSeed()}/><VisitRecorder/><DeniaDetails/></Providers></body></html>}
