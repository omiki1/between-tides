import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
export function ProjectsPreview(){return <section className="home-section"><SectionTitle number="02" title="把想法变成现实" english="SELECTED PROJECTS" href="/projects/" link="所有项目"/><div className="projects-grid">{projects.slice(0,2).map(p=><ProjectCard key={p.id} project={p}/>)}</div><p className="section-footnote">医学证据工作台，以及通向它的图谱练习</p></section>}
