import Link from "next/link";
import { ArrowUpRight, GitBranch, Database, Search, Workflow, Layers } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectVisual({ visual }: { visual: Project["visual"] }) {
  if (visual === "graph") {
    return <>
      <div className="graph-label">MEDIATLAS / EVIDENCE RAG</div>
      <svg viewBox="0 0 600 190" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M95 95H215L300 45H440M215 95L300 145H440M215 95H380"/><circle cx="215" cy="95" r="45" opacity=".18"/><circle cx="215" cy="95" r="75" opacity=".08"/></g></svg>
      <span className="graph-node n1">Query</span>
      <span className="graph-node n2"><GitBranch size={17}/> RAG</span>
      <span className="graph-node n3">Graph</span>
      <span className="graph-node n4">Gate</span>
      <span className="graph-node n5">Answer</span>
    </>;
  }
  if (visual === "nodes") {
    return <>
      <div className="graph-label">NEO4J / DISEASE GRAPH</div>
      <svg viewBox="0 0 600 190" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M300 95H150M300 95H450M300 95L210 40M300 95L390 40M300 95L210 150M300 95L390 150"/><circle cx="300" cy="95" r="40" opacity=".16"/></g></svg>
      <span className="graph-node n-center"><Database size={16}/> Disease</span>
      <span className="graph-node n1">Symptom</span>
      <span className="graph-node n3">Drug</span>
      <span className="graph-node n4">Food</span>
      <span className="graph-node n5">Dept</span>
    </>;
  }
  if (visual === "search") {
    return <>
      <div className="graph-label">RETRIEVE / HYBRID SEARCH</div>
      <svg viewBox="0 0 600 190" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M90 95H510M215 95V48H380M215 95V142H380"/><circle cx="215" cy="95" r="36" opacity=".16"/></g></svg>
      <span className="graph-node n1">Load</span>
      <span className="graph-node n2"><Search size={16}/> Split</span>
      <span className="graph-node n3">BM25</span>
      <span className="graph-node n4">Dense</span>
      <span className="graph-node n5">RRF</span>
    </>;
  }
  if (visual === "flow") {
    return <>
      <div className="graph-label">AGENT / REACT LOOP</div>
      <svg viewBox="0 0 600 190" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M110 95H490M300 95V42M300 95V148"/><circle cx="300" cy="95" r="42" opacity=".16"/></g></svg>
      <span className="graph-node n1">Observe</span>
      <span className="graph-node n2"><Workflow size={16}/> Think</span>
      <span className="graph-node n3">Act</span>
      <span className="graph-node n5">Memory</span>
    </>;
  }
  return <>
    <div className="graph-label">FASTAPI / LAYERED SERVICE</div>
    <div className="stack-visual">
      <span className="stack-layer"><Layers size={14}/> Controller</span>
      <span className="stack-layer">Service</span>
      <span className="stack-layer">DAO · MySQL / Redis</span>
    </div>
  </>;
}

export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <article className={`project-card ${p.featured ? "featured-project" : ""}`} id={p.id}>
      <Link href={`/projects/${p.id}/`} className="project-card-link" aria-label={`阅读 ${p.name} 的正文`}>
        <div className={`project-visual ${p.visual}`} aria-hidden="true">
          <ProjectVisual visual={p.visual} />
        </div>
        <div className="project-info">
          <div className="project-title">
            <h3>{p.name}</h3>
            <span className="project-status">{p.status}</span>
          </div>
          <p>{p.description}</p>
          <div className="project-bottom">
            <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
            <span className="project-links">阅读正文<ArrowUpRight size={14}/></span>
          </div>
        </div>
      </Link>
      {p.github ? (
        <a className="project-repo" href={p.github} target="_blank" rel="noreferrer" aria-label={`${p.name} 的 GitHub 仓库`}>
          GitHub<ArrowUpRight size={14}/>
        </a>
      ) : null}
    </article>
  );
}
