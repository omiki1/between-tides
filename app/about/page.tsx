import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight,Code2,Music2,Sparkles,Compass,PenLine,Coffee } from "lucide-react";
import { site } from "@/config/site";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export const metadata: Metadata = {
  title: "关于",
  description: "关于汐间、关于 omiki1，以及这个小站为什么被建起来。",
  alternates: { canonical: "/about/" },
};
const interests = [
  { icon:Code2, title:"写代码", text:"喜欢把复杂的东西拆成能解释清楚的小块，正在学习 Agent 与检索系统的设计。" },
  { icon:Sparkles, title:"问问题", text:"对「为什么这样更好」的兴趣，常常大于对「怎么做最快」的兴趣。" },
  { icon:Music2, title:"听声音", text:"喜欢听歌，也把常听的歌放在这里。" },
  { icon:Compass, title:"四处看", text:"山、湖、夜里的星，都是会被记下来的画面。" },
];
export default function AboutPage(){
  return <main id="main" className="container inner">
    <Reveal className="page-head about-head">
      <span className="page-eyebrow"><i/>ABOUT / 关于</span>
      <h1>你好，我是 <span>{site.nickname}</span>。</h1>
      <p>一个普通的开发者，白天写代码，晚上想把白天没想明白的事写下来。「汐间」是这些想法暂时停靠的地方。</p>
      <div className="about-identity">
        <div className="about-mark"><Image src={site.avatar} alt={`${site.nickname} 的头像`} width={46} height={46}/></div>
        <div>
          <p className="about-name">{site.nickname}</p>
          <p className="about-role">{site.role}</p>
          <p className="about-location">目前坐标 · {site.location}</p>
        </div>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>这个小站</h2><span className="eyebrow">WHY THIS SITE</span></div></div>
      <div className="about-columns">
        <div className="about-text">
          <p>{site.description}这里没有推荐算法，也不追求更新频率。我只想有一个地方，可以慢慢整理关于设计、技术，以及一点点生活的事。</p>
        </div>
        <aside className="about-facts">
          <div><span>站点名</span><b>{site.name} / {site.wordmark}</b></div>
          <div><span>建立于</span><b>2026.09</b></div>
          <div><span>技术栈</span><b>Next.js · React · 手写 CSS</b></div>
          <div><span>内容形态</span><b>Markdown · TypeScript · JSON</b></div>
        </aside>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">02</span><h2>我在意的事</h2><span className="eyebrow">INTERESTS</span></div></div>
      <div className="interest-grid">
        {interests.map(({icon:Icon,title,text})=><article key={title}><Icon size={18}/><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </Reveal>

<Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">03</span><h2>近况与联系</h2><span className="eyebrow">NOW & CONTACT</span></div></div>
      <div className="about-now">
        <div><Coffee size={16}/><span>正在学习</span><b>{site.now.learning}</b></div>
        <div><PenLine size={16}/><span>正在做</span><b>{site.now.building}</b></div>
        <div><span className="status-dot"/><span>上次更新</span><b>{site.now.updated}</b></div>
      </div>
      <p className="method-note">{site.github ? <>代码在 <a href={site.github} rel="me" target="_blank">GitHub @omiki1</a>。</> : null}哔哩哔哩在 <a href={site.bilibili} rel="me" target="_blank">空间 A1478L</a>，追番已同步到<Link href="/anime/">这个页面</Link>。邮箱仍未公开。想继续看的话，也可以从<Link href="/blog/">手记</Link>或<Link href="/projects/">项目</Link>开始。</p>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">04</span><h2>从哪里开始逛</h2><span className="eyebrow">START HERE</span></div></div>
      <div className="start-grid">
        {site.nav.filter(item=>item.href!=="/").map(item=><Link key={item.href} href={item.href}>{item.label}<ArrowUpRight size={15}/></Link>)}
      </div>
    </Reveal>

    <SideRail current="about"/>
  </main>;
}
