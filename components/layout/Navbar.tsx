"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "./ThemeSwitch";
import { FontSwitch } from "./FontSwitch";
import { useEffect,useState,useRef } from "react";
import { Search,Menu,X,Github } from "lucide-react";
import { site } from "@/config/site";
import { WaveMark } from "@/components/ui/Logo";
export function Navbar(){
 const pathname=usePathname(); const [scrolled,setScrolled]=useState(false); const menu=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const update=()=>setScrolled(window.scrollY>24);update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update)},[]);
 return <header className={`navbar ${scrolled?"scrolled":""}`}><div className="nav-inner"><Link href="/" className="brand" aria-label="汐间首页"><WaveMark/><span>{site.name}<small>{site.wordmark}</small></span></Link><nav aria-label="主导航" className="desktop-nav">{site.nav.map(n=><Link key={n.href} href={n.href} aria-current={(pathname==="/"?n.href==="/":n.href!=="/"&&pathname.startsWith(n.href.replace(/\/$/,"")))?"page":undefined}>{n.label}</Link>)}</nav><div className="nav-tools"><button aria-label="搜索网站" className="search-trigger" onClick={()=>window.dispatchEvent(new Event("open-search"))}><Search size={16}/><kbd>⌘ K</kbd></button><FontSwitch/><ThemeSwitch/>{site.github&&<a href={site.github} className="icon-button" aria-label="GitHub" target="_blank" rel="me noreferrer"><Github size={17}/></a>}<button className="icon-button mobile-menu" aria-label="打开导航" onClick={()=>menu.current?.showModal()}><Menu size={20}/></button></div></div><dialog ref={menu} className="mobile-dialog" onClick={e=>{if(e.target===e.currentTarget)menu.current?.close()}}><div><div className="dialog-heading"><span>去哪里逛逛？</span><button className="icon-button" aria-label="关闭导航" onClick={()=>menu.current?.close()}><X/></button></div><nav aria-label="移动端导航">{site.nav.map(n=><Link key={n.href} href={n.href} onClick={()=>menu.current?.close()}>{n.label}</Link>)}{site.github?<a href={site.github} target="_blank" rel="me noreferrer" onClick={()=>menu.current?.close()}>GitHub</a>:null}</nav></div></dialog></header>
}

