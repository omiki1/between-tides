"use client";
import { useState } from "react";
import Link from "next/link";
/**
 * 404 页的小彩蛋：吹泡泡的达妮娅（官方宣传图抠图）+ 几个 CSS 泡泡，戳破 3 个就漂出一篇随机手记。
 * prefers-reduced-motion 时泡泡不漂浮、不炸开，只是直接消失。
 */
const BUBBLES = [
  { x: 6, y: 30, s: 34, d: 9, dl: 1 }, { x: 18, y: 12, s: 22, d: 11, dl: 3 }, { x: 74, y: 16, s: 30, d: 10, dl: 2 },
  { x: 86, y: 44, s: 20, d: 8, dl: 5 }, { x: 10, y: 58, s: 26, d: 12, dl: 6 }, { x: 72, y: 62, s: 38, d: 9.5, dl: 4 }, { x: 42, y: 4, s: 18, d: 10, dl: 7 },
];
const GOAL = 3;
/* 只在点击时调用（放在组件外，避免被当成渲染期的不纯调用） */
const pickOne = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
export function BubbleStage({ posts }: { posts: { title: string; href: string }[] }) {
  const [popped, setPopped] = useState<number[]>([]);
  const [found, setFound] = useState<{ title: string; href: string } | null>(null);
  const pop = (index: number) => {
    if (popped.includes(index)) return;
    const next = [...popped, index];
    setPopped(next);
    if (next.length === GOAL && posts.length) setFound(pickOne(posts));
  };
  const left = GOAL - popped.length;
  return <>
    <p className="ft-404-found" aria-live="polite">
      {found ? <>泡泡里漂出来一篇：<Link href={found.href}>{found.title} ↗</Link><br />不是你要找的那一页，但也许值得一读。</>
        : popped.length ? <>噗。还差 <b>{left}</b> 个。</>
        : <>她吹出的泡泡里，也许有你要找的那一页。<br />戳破 <b>{GOAL}</b> 个看看。</>}
    </p>
    <div className="ft-404-stage">
      {BUBBLES.map((b, index) => (
        <button key={index} type="button" className={`ft-404-pop${popped.includes(index) ? " is-popped" : ""}`} disabled={popped.includes(index) || Boolean(found)}
          style={{ left: `${b.x}%`, top: `${b.y}%`, "--sz": `${b.s}px`, "--d": `${b.d}s`, "--dl": `-${b.dl}s` } as React.CSSProperties}
          aria-label="戳破泡泡" onClick={() => pop(index)}>
          <i className="ft-bubble" />
        </button>
      ))}
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ft-404-denia" src="/artwork/denia/bubble-420.webp" srcSet="/artwork/denia/bubble-420.webp 420w, /artwork/denia/bubble-840.webp 840w"
          sizes="(max-width: 760px) 264px, 366px" width={420} height={541} alt="正在吹泡泡的达妮娅" decoding="async" />
        <figcaption><small className="ft-art-credit">OFFICIAL ART · KURO GAMES <b>· 鸣潮 2 周年宣传图</b></small></figcaption>
      </figure>
    </div>
  </>;
}
