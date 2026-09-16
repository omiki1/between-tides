import type { Metadata } from "next";
import { ArrowUpRight, Sparkles, FlaskConical, PenLine } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";

export const metadata: Metadata = {
  title: "项目",
  description: "医学证据工作台 MediAtlas，以及通向它的图谱、检索、Agent 与 FastAPI 练习。",
  alternates: { canonical: "/projects/" },
};

const stageCopy: Record<string, string> = {
  可运行原型: "本地能跑通整条对话与检索链，还没有对外发布。",
  图谱实验: "先把实体和关系建起来，再接到自然语言问答。",
  检索实验: "把加载、切分、召回和融合拆开练。",
  学习工程: "按阶段判断何时用 LLM、工作流或智能体。",
  基础模块: "验证码、分层和缓存，后来接到完整系统里。",
};

export default function ProjectsPage() {
  const [first, ...others] = projects;
  return (
    <main id="main" className="container inner">
      <Reveal className="page-head">
        <span className="page-eyebrow"><i/>SELECTED PROJECTS / 项目</span>
        <h1>把好奇心，<span>做成能用的东西。</span></h1>
        <p>这些项目沿着同一条线走：先把检索、图谱和接口拆开练，再接到一个能回答医疗问题的工作台。它们跑在本地，没有对外发布的版本。</p>
        <div className="page-stats">
          <span><b>{projects.length}</b> 个项目</span>
          <span><b>{projects.filter((p) => p.status === "可运行原型").length}</b> 个可运行原型</span>
          <span>从练习接到完整系统</span>
        </div>
      </Reveal>

      {first ? (
        <section className="home-section" aria-labelledby="focus-heading">
          <div className="section-title"><div><span className="section-number">01</span><h2 id="focus-heading">当前重点</h2><span className="eyebrow">IN FOCUS</span></div></div>
          <Reveal><ProjectCard project={first}/></Reveal>
          <p className="section-footnote">{stageCopy[first.status] ?? ""}</p>
        </section>
      ) : null}

      <section className="home-section" aria-labelledby="more-heading">
        <div className="section-title"><div><span className="section-number">02</span><h2 id="more-heading">练习与地基</h2><span className="eyebrow">STUDIOS</span></div></div>
        <div className="projects-grid">{others.map((project) => <Reveal key={project.id}><ProjectCard project={project}/><p className="section-footnote">{stageCopy[project.status] ?? ""}</p></Reveal>)}</div>
      </section>

      <section className="home-section" aria-labelledby="method-heading">
        <div className="section-title"><div><span className="section-number">03</span><h2 id="method-heading">做事的方式</h2><span className="eyebrow">HOW I BUILD</span></div></div>
        <div className="method-grid">
          <article><Sparkles size={18}/><h3>先想清楚问题</h3><p>写代码之前先写下要解决的具体麻烦，避免为了技术而技术。</p></article>
          <article><FlaskConical size={18}/><h3>做最小可验证的原型</h3><p>把最不确定的一环先跑通，再决定要不要继续投入。</p></article>
          <article><PenLine size={18}/><h3>把过程写下来</h3><p>记录掉过的坑，让下一次的自己少走一点弯路。</p></article>
        </div>
        <p className="method-note">MediAtlas 是个人学习与研究工作台，不是诊疗工具。已公开的仓库会附 GitHub 链接；其余练习仍只在本地。<a href="/about/">想知道我在做什么，可以看关于页<ArrowUpRight size={14}/></a></p>
      </section>

      <SideRail current="projects"/>
    </main>
  );
}
