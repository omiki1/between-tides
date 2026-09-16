import notes from "@/content/notes/notes.json";
import { SectionTitle } from "@/components/ui/SectionTitle";
export function NotesPreview(){return <section className="home-section notes-preview"><SectionTitle number="04" title="此刻，和一些碎念" english="LITTLE MOMENTS" href="/notes/" link="全部随记"/><div className="notes-preview-grid">{notes.slice(0,2).map(n=><article key={n.id}><time>{n.date.replaceAll("-",".")}</time><p>{n.text}</p><div className="tags">{n.tags.map(t=><span key={t}># {t}</span>)}</div></article>)}</div></section>}
