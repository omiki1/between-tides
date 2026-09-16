import { ArrowUpRight,Command } from "lucide-react";
import Link from "next/link";
import { site } from "@/config/site";
export function NowPanel(){return <section className="now-panel"><div className="now-header"><span className="eyebrow"><span className="status-dot"/>NOW, NOT FOREVER</span><Link href="/about/" aria-label="查看近况"><ArrowUpRight size={17}/></Link></div><div className="now-content"><div className="now-symbol"><Command size={25}/></div><div><p>保持好奇，持续构建。</p><span>正在探索 <b>{site.now.learning}</b></span></div></div><div className="now-bottom"><span>BUILDING<span>{site.now.building}</span></span><time>{site.now.updated}</time></div></section>}
