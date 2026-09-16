import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/effects/AmbientBackground";
import { PointerEffects } from "@/components/effects/PointerEffects";
import { Sakura } from "@/components/effects/Sakura";
import { MusicDock } from "@/components/layout/MusicDock";
import { SearchDialog } from "@/components/search/SearchDialog";
import "./globals.css";
const manrope=localFont({src:"../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",variable:"--font-manrope",display:"swap"});
export const metadata:Metadata={metadataBase:new URL(site.url),title:{default:site.seo.title,template:`%s · ${site.name}`},description:site.description,keywords:site.seo.keywords,openGraph:{title:site.seo.title,description:site.description,type:"website",locale:"zh_CN",siteName:site.name},twitter:{card:"summary",title:site.seo.title,description:site.description},icons:{icon:"/favicon.svg"},alternates:{types:{"application/rss+xml":"/rss.xml"}}};
export const viewport:Viewport={themeColor:[{media:"(prefers-color-scheme: dark)",color:"#110e1e"},{media:"(prefers-color-scheme: light)",color:"#f7f3f8"}],colorScheme:"dark light"};
const fontBoot=`(function(){try{var m=localStorage.getItem("firefly-font-mode");document.documentElement.dataset.fontMode=m==="original"?"original":"wenkai"}catch(e){}})()`;
const introBoot=`(function(){try{var p=location.pathname.replace(/\\/+$/,"")||"/";if(p!=="/")return;if(/[?&]intro=1(?:&|$)/.test(location.search))sessionStorage.removeItem("between-tides.home-intro-seen.v2");var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduced||sessionStorage.getItem("between-tides.home-intro-seen.v2")==="1"){document.documentElement.dataset.intro="seen"}else{document.documentElement.dataset.intro="boot"}}catch(e){}})()`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN" data-scroll-behavior="smooth" data-font-mode="wenkai" suppressHydrationWarning><body className={manrope.variable}><script dangerouslySetInnerHTML={{__html:fontBoot}}/><script dangerouslySetInnerHTML={{__html:introBoot}}/><Providers><a className="skip-link" href="#main">跳到主要内容</a><AmbientBackground/><Sakura/><PointerEffects/><Navbar/>{children}<MusicDock/><Footer/><SearchDialog/></Providers></body></html>}
