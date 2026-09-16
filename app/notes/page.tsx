import type { Metadata } from "next";
/* eslint-disable @next/next/no-img-element -- note images are already web-sized originals served from /public. */
import { ArrowUpRight,Command,Timer } from "lucide-react";
import { getNotes, getNoteTags } from "@/lib/notes";
import { site } from "@/config/site";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
export const metadata: Metadata = {
  title: "随记",
  description: "短句子、片刻的想法和一些还没有答案的问题。",
  alternates: { canonical: "/notes/" },
};
export default function NotesPage(){
  const notes=getNotes();
  const tags=getNoteTags();
  return <main id="main" className="container inner">
    <Reveal className="page-head">
      <span className="page-eyebrow"><i/>LITTLE MOMENTS / 随记</span>
      <h1>此刻，<span>和一些碎念。</span></h1>
      <p>不是每件事都值得写成文章。有些话很短，说完就好，放在这里当作时间留下的小刻度。</p>
      <div className="page-stats">
        <span><b>{notes.length}</b> 条随记</span>
        <span><b>{tags.length}</b> 个标签</span>
        <span>更新于 <b>{notes[0].date.replaceAll("-",".")}</b></span>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="now-strip">
        <div className="now-strip-item"><Command size={16}/><span>正在探索</span><b>{site.now.learning}</b></div>
        <div className="now-strip-item"><Timer size={16}/><span>正在做</span><b>{site.now.building}</b></div>
        <div className="now-strip-item"><span className="status-dot"/><span>当前状态</span><b>{site.now.activity}</b></div>
      </div>
    </Reveal>

    <Reveal as="section" className="home-section">
      <div className="section-title"><div><span className="section-number">01</span><h2>时间线</h2><span className="eyebrow">TIMELINE</span></div><div className="tag-row">{tags.map(tag=><span className="tag-chip" key={tag}># {tag}</span>)}</div></div>
      <ol className="notes-timeline">
        {notes.map(note=><li key={note.id} id={note.id}>
          <span className="timeline-dot" aria-hidden="true"/>
          <time dateTime={note.date}>{note.date.replaceAll("-",".")}</time>
          <div className="timeline-body">
            <p>{note.text}</p>
            {note.image&&<img src={note.image} alt="" width={1400} height={934} loading="lazy" decoding="async"/>}
            <div className="tags">{note.tags.map(tag=><span key={tag}># {tag}</span>)}</div>
          </div>
        </li>)}
      </ol>
      <p className="method-note">随记内容为本站示例文本，用来展示这一栏的节奏与排版。<a href="/about/">想了解这个小站的定位<ArrowUpRight size={14}/></a></p>
    </Reveal>

    <SideRail current="notes"/>
  </main>;
}
