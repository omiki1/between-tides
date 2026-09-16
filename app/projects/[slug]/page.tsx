import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { getProject, projectNeighbours, projects } from "@/data/projects";
import { readProjectBody } from "@/lib/projects";
import { renderMarkdown, extractHeadings } from "@/lib/markdown";
import { ProjectVisual } from "@/components/projects/ProjectCard";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "没有找到这个项目" };
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}/` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const html = await renderMarkdown(readProjectBody(project.id));
  const headings = extractHeadings(html);
  const { previous, next } = projectNeighbours(project.id);
  const others = projects.filter((item) => item.id !== project.id);
  return (
    <main id="main" className="container inner">
      <Reveal className="reading-head">
        <Link className="back-link" href="/projects/"><ArrowLeft size={15}/>所有项目</Link>
        <span className="page-eyebrow" style={{ marginTop: "22px" }}><i/>{project.status} / {project.name}</span>
        <h1>{project.name}<span>，{project.subtitle}</span></h1>
        <p className="reading-lede">{project.description}</p>
        <div className="reading-tags" aria-label="技术栈">
          {project.tags.map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}
          {project.github ? (
            <a className="tag-chip" href={project.github} target="_blank" rel="noreferrer">GitHub 仓库<ArrowUpRight size={13}/></a>
          ) : null}
        </div>
      </Reveal>
      <Reveal className={`project-visual project-hero-visual ${project.visual}`} aria-hidden="true">
        <ProjectVisual visual={project.visual} />
      </Reveal>
      <div className="reading-layout">
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="reading-aside">
          <TableOfContents headings={headings} />
          {project.github ? (
            <div className="aside-card">
              <span className="eyebrow">SOURCE</span>
              <p>公开仓库在 GitHub，代码以仓库为准。</p>
              <a className="text-link" href={project.github} target="_blank" rel="noreferrer">打开仓库<ArrowUpRight size={14}/></a>
            </div>
          ) : null}
          <div className="aside-card">
            <span className="eyebrow">OTHER PROJECTS</span>
            <p>同一条线上的另外 {others.length} 个项目。</p>
            <Link className="text-link" href="/projects/">返回项目列表<ArrowUpRight size={14}/></Link>
          </div>
        </aside>
      </div>
      <nav className="post-pager" aria-label="相邻项目">
        {previous ? <Link href={`/projects/${previous.id}/`}><ArrowLeft size={16}/><span><small>上一个</small>{previous.name}</span></Link> : <span />}
        {next ? <Link href={`/projects/${next.id}/`} className="pager-next"><span><small>下一个</small>{next.name}</span><ArrowRight size={16}/></Link> : <span />}
      </nav>
      <SideRail current="projects" />
    </main>
  );
}
