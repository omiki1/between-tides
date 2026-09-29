"use client";

import { useEffect, useRef, useState } from "react";

type Petal = {
  id: number;
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  rot: number;
  vr: number;
};

const ROUND_MS = 20000;
const MAX_PETALS = 12;
const R_MIN = 9;
const R_MAX = 14;
/** Invisible padding around the painted petal — larger click target. */
const HIT_PAD = 20;
const SPEED_MIN = 0.9;
const SPEED_MAX = 3.2;
const SPAWN_MAX_MS = 680;
const SPAWN_MIN_MS = 150;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function readNow() {
  return performance.now();
}

function frozenPetal(id: number, w: number): Petal {
  return {
    ...spawn(id, w),
    y: 20 + Math.random() * 120,
    vy: 0,
    vx: 0,
    vr: 0,
  };
}

function spawn(id: number, w: number): Petal {
  const r = R_MIN + Math.random() * (R_MAX - R_MIN);
  return {
    id,
    x: 8 + Math.random() * Math.max(24, w - 40),
    y: -18 - Math.random() * 30,
    r,
    vy: 0.48 + Math.random() * 0.5,
    vx: -0.3 + Math.random() * 0.6,
    rot: Math.random() * 360,
    vr: -1 + Math.random() * 2,
  };
}

export function SakuraPick() {
  const areaRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<Petal[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  const rafRef = useRef(0);
  const idRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const endAtRef = useRef(0);
  const startAtRef = useRef(0);
  const playingRef = useRef(false);
  const reducedRef = useRef(false);
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [leftSec, setLeftSec] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem("between-tides.sakura-pick.best");
        if (raw) setBest(Number(raw) || 0);
      } catch {}
    });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const finish = (finalScore: number) => {
    cancelAnimationFrame(rafRef.current);
    playingRef.current = false;
    petalsRef.current = [];
    setPetals([]);
    setPlaying(false);
    setLeftSec(0);
    setBest((prev) => {
      const next = Math.max(prev, finalScore);
      try {
        localStorage.setItem("between-tides.sakura-pick.best", String(next));
      } catch {}
      return next;
    });
  };

  const loop = (now: number) => {
    if (!playingRef.current) return;
    const el = areaRef.current;
    if (!el) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    const w = el.clientWidth;
    const h = el.clientHeight;
    const remain = endAtRef.current - now;
    if (remain <= 0) {
      finish(scoreRef.current);
      return;
    }
    setLeftSec(Math.ceil(remain / 1000));

    const elapsed = now - startAtRef.current;
    // 0-10s gentle; after 10s accelerate hard toward the cap (round still 20s).
    const late = clamp01((elapsed - 10000) / 10000);
    const early = clamp01(elapsed / 10000);
    const ease = early < 1 ? early * early * 0.35 : 0.35 + late * late * 0.65;
    const speedMul = SPEED_MIN + (SPEED_MAX - SPEED_MIN) * ease;
    const spawnEvery = SPAWN_MAX_MS - (SPAWN_MAX_MS - SPAWN_MIN_MS) * ease;
    const reduced = reducedRef.current;

    if (!reduced && now - lastSpawnRef.current > spawnEvery && petalsRef.current.length < MAX_PETALS) {
      petalsRef.current.push(spawn(idRef.current++, w));
      lastSpawnRef.current = now;
    }

    petalsRef.current = petalsRef.current
      .map((p) => ({
        ...p,
        y: p.y + p.vy * (reduced ? 0 : speedMul),
        x: p.x + p.vx * (reduced ? 0 : Math.min(1.35, speedMul * 0.55)),
        rot: p.rot + p.vr * (0.7 + ease * 0.6),
      }))
      .filter((p) => p.y < h + 28);

    setPetals(petalsRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const start = () => {
    cancelAnimationFrame(rafRef.current);
    petalsRef.current = [];
    idRef.current = 1;
    scoreRef.current = 0;
    setScore(0);
    setPlaying(true);
    playingRef.current = true;
    const now = readNow();
    startAtRef.current = now;
    endAtRef.current = now + ROUND_MS;
    lastSpawnRef.current = now;
    const w = areaRef.current?.clientWidth ?? 220;

    // seed a few petals immediately so the round never feels empty
    if (reducedRef.current) {
      petalsRef.current = Array.from({ length: 5 }, (_, i) => ({
        ...spawn(idRef.current++, w),
        y: 24 + i * 28,
        x: 20 + ((i * 37) % Math.max(40, w - 40)),
        vy: 0,
        vx: 0,
        vr: 0,
      }));
    } else {
      petalsRef.current = [
        spawn(idRef.current++, w),
        spawn(idRef.current++, w),
        spawn(idRef.current++, w),
      ];
    }
    setPetals(petalsRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  const onPick = (id: number) => {
    if (!playingRef.current) return;
    const before = petalsRef.current.length;
    petalsRef.current = petalsRef.current.filter((p) => p.id !== id);
    if (petalsRef.current.length === before) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    if (reducedRef.current) {
      const w = areaRef.current?.clientWidth ?? 220;
      petalsRef.current.push(frozenPetal(idRef.current++, w));
    }
    setPetals(petalsRef.current.slice());
  };

  return (
    <article className="widget-card sakura-pick">
      <div className="widget-head">
        <span className="eyebrow">小游戏</span>
        <span className="sakura-pick-best">最佳 {best}</span>
      </div>
      <p className="sakura-pick-hint">拾樱 · 点落花瓣</p>
      <div
        ref={areaRef}
        className={`sakura-pick-area${playing ? " is-playing" : ""}`}
        role="application"
        aria-label="拾樱小游戏"
      >
        {!playing ? (
          <button type="button" className="sakura-pick-start" onClick={start}>
            开始
          </button>
        ) : (
          <div className="sakura-pick-hud" aria-live="polite">
            <span>{score} 片</span>
            <span>{leftSec}s</span>
          </div>
        )}
        {petals.map((p) => {
          const hit = (p.r + HIT_PAD) * 2;
          return (
            <button
              key={p.id}
              type="button"
              className="sakura-pick-petal"
              style={{
                transform: `translate(${p.x - HIT_PAD}px, ${p.y - HIT_PAD}px) rotate(${p.rot}deg)`,
                width: hit,
                height: hit,
                ["--petal-r" as string]: `${p.r}px`,
              }}
              aria-label="拾取花瓣"
              onPointerDown={(e) => {
                e.preventDefault();
                onPick(p.id);
              }}
            />
          );
        })}
      </div>
    </article>
  );
}
