import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SectionTitle({number,title,english,href,link="查看全部"}:{number:string;title:string;english:string;href?:string;link?:string}) { return <div className="section-title"><div><span className="section-number">{number}</span><h2>{title}</h2><span className="eyebrow">{english}</span></div>{href&&<Link href={href} className="text-link">{link}<ArrowUpRight size={15}/></Link>}</div>; }
