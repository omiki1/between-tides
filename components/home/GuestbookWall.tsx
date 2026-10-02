"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";

type Note = {
  id: string;
  name: string;
  text: string;
  color: number;
  x: number;
  y: number;
  rot: number;
  seed?: boolean;
};

const STORAGE_KEY = "between-tides.guestbook.v1";
const MAX_NOTES = 40;
const MAX_LEN = 80;

const COLORS = [
  "#fff4c8",
  "#ffe0ec",
  "#d9f3ff",
  "#e6ffe4",
  "#f0e4ff",
  "#ffe8d6",
];

/** Seed notes placed away from the character (center-right). */
const SEED: Note[] = [
  {
    id: "seed-1",
    name: "收束点",
    text: "欢迎来到幻想收束点，留下一句吧。",
    color: 0,
    x: 8,
    y: 14,
    rot: -6,
    seed: true,
  },
  {
    id: "seed-2",
    name: "纸飞机",
    text: "愿你今天也有一点点微光。",
    color: 2,
    x: 22,
    y: 58,
    rot: 4,
    seed: true,
  },
  {
    id: "seed-3",
    name: "路过",
    text: "站子也温柔。",
    color: 1,
    x: 6,
    y: 72,
    rot: -3,
    seed: true,
  },
];

function loadNotes(): Note[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return SEED;
    const user = parsed.filter((n) => n && typeof n.text === "string" && !n.seed);
    return [...SEED, ...user].slice(0, MAX_NOTES);
  } catch {
    return SEED;
  }
}

function saveUserNotes(notes: Note[]) {
  const user = notes.filter((n) => !n.seed);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* private mode */
  }
}

function randomNoteMeta() {
  return {
    color: Math.floor(Math.random() * COLORS.length),
    x: 4 + Math.random() * 38,
    y: 8 + Math.random() * 62,
    rot: -8 + Math.random() * 16,
  };
}

export function GuestbookWall() {
  const [notes, setNotes] = useState<Note[]>(SEED);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setNotes(loadNotes());
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = useMemo(() => notes.length, [notes]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = text.trim().slice(0, MAX_LEN);
    if (!body) return;
    const meta = randomNoteMeta();
    const next: Note = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: (name.trim() || "匿名").slice(0, 16),
      text: body,
      ...meta,
    };
    setNotes((prev) => {
      const merged = [...prev, next].slice(0, MAX_NOTES);
      saveUserNotes(merged);
      return merged;
    });
    setText("");
    setOpen(false);
  };

  const clearMine = () => {
    setNotes((prev) => {
      const kept = prev.filter((n) => n.seed);
      saveUserNotes(kept);
      return kept;
    });
  };

  return (
    <section className="home-section guestbook-section" aria-labelledby="guestbook-title">
      <SectionTitle number="05" title="留言板" english="GUESTBOOK" />
      <p className="guestbook-lead" id="guestbook-title">
        在天空里贴一张小纸条。目前先存在你的浏览器里，换设备不会同步。
      </p>

      <div className="guestbook-frame">
        <div className="guestbook-stage" style={{ aspectRatio: "4080 / 2296" }}>
          <Image
            src="/assets/guestbook/sky-board.webp"
            alt="粉发少女坐在纸飞机上，彩色纸飞机与气泡漂浮在彩虹天空"
            fill
            sizes="(max-width: 900px) 100vw, 960px"
            className="guestbook-bg"
            priority={false}
          />
          <div className="guestbook-veil" aria-hidden="true" />

          <ul className="guestbook-notes" aria-label="留言便利贴">
            {notes.map((n) => (
              <li
                key={n.id}
                className={`guestbook-note${n.seed ? " is-seed" : ""}`}
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  background: COLORS[n.color % COLORS.length],
                  transform: `rotate(${n.rot}deg)`,
                }}
              >
                <p>{n.text}</p>
                <span>— {n.name}</span>
              </li>
            ))}
          </ul>

          <div className="guestbook-toolbar">
            <button type="button" className="guestbook-write" onClick={() => setOpen((v) => !v)}>
              {open ? "收起" : "写一句"}
            </button>
            <span className="guestbook-count">{ready ? `${count} 张纸条` : "…"}</span>
            <button type="button" className="guestbook-clear" onClick={clearMine}>
              清空我的
            </button>
          </div>

          {open ? (
            <form className="guestbook-form" onSubmit={onSubmit}>
              <label>
                <span>昵称</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  placeholder="匿名也可以"
                  autoComplete="nickname"
                />
              </label>
              <label>
                <span>留言</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={MAX_LEN}
                  rows={3}
                  placeholder="最多 80 字，贴在天空左侧～"
                  required
                />
              </label>
              <div className="guestbook-form-actions">
                <small>
                  {text.length}/{MAX_LEN}
                </small>
                <button type="submit">贴上去</button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
