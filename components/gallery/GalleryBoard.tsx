"use client";
/* eslint-disable @next/next/no-img-element -- local originals with known intrinsic dimensions. */
import { useCallback, useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight, Grid2X2, LayoutGrid } from "lucide-react";
import type { Photo } from "@/data/gallery";

export function GalleryBoard({ photos }: { photos: Photo[] }) {
  const [compact, setCompact] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = openIndex === null ? null : photos[openIndex];
  const finishClose = useCallback(() => { setOpenIndex(null); opener.current?.focus(); opener.current = null; }, []);
  const step = useCallback((direction: number) => setOpenIndex(index => {
    if (index === null || photos.length === 0) return index;
    return (index + direction + photos.length) % photos.length;
  }), [photos.length]);
  useEffect(() => { if (openIndex !== null && !dialog.current?.open) dialog.current?.showModal(); }, [openIndex]);
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, step]);
  return <>
    <div className="album-summary"><span>{photos.length} 张图片</span><div role="group" aria-label="相册布局">
      <button className="icon-button" aria-label="大图布局" aria-pressed={!compact} onClick={() => setCompact(false)}><Grid2X2 size={17}/></button>
      <button className="icon-button" aria-label="紧凑布局" aria-pressed={compact} onClick={() => setCompact(true)}><LayoutGrid size={17}/></button>
    </div></div>
    <div className={`gallery-board album-board ${compact ? "album-compact" : ""}`}>
      {photos.map((photo, index) => <figure key={photo.id} id={photo.id} className="gallery-item">
        <button className="gallery-open" onClick={event => { opener.current = event.currentTarget; setOpenIndex(index); }} aria-label={`查看${photo.title}`}>
          <img src={photo.src} alt={photo.title} width={photo.width} height={photo.height} loading="lazy" decoding="async"/>
          <span className="gallery-zoom" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        </button>
      </figure>)}
    </div>
    <dialog ref={dialog} className="lightbox" aria-label="相册大图" onClose={finishClose} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {open && <div className="lightbox-inner">
        <button className="lightbox-close icon-button" onClick={() => dialog.current?.close()} aria-label="关闭大图"><X size={18}/></button>
        <div className="lightbox-stage"><img src={open.src} alt={open.title} width={open.width} height={open.height}/></div>
        <div className="lightbox-caption album-caption">
          <span>{open.title}<small> · {open.english}</small></span>
          <div className="lightbox-nav">
            <button className="icon-button" onClick={() => step(-1)} aria-label="上一张"><ArrowLeft size={17}/></button>
            <span aria-live="polite">{(openIndex ?? 0) + 1} / {photos.length}</span>
            <button className="icon-button" onClick={() => step(1)} aria-label="下一张"><ArrowRight size={17}/></button>
          </div>
        </div>
      </div>}
    </dialog>
  </>;
}
