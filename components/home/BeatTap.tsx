"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSiteMusicSnapshot,
  subscribeBeats,
  subscribeSiteMusic,
  type SiteMusicSnapshot,
} from "@/lib/site-music-bus";

const ROUND_MS = 28000;
/** Half-window: tap within ±140ms of a beat counts as HIT. */
const HIT_WINDOW_MS = 140;
const BEAT_SCORE = 10;
const BEST_KEY = "between-tides.beat-tap.best";

type Phase = "idle" | "playing" | "paused-music" | "done";
type Flash = "hit" | "miss" | null;
type PendingBeat = { t: number; resolved: boolean };

function markResolved(beats: PendingBeat[], target: PendingBeat): PendingBeat[] {
  return beats.map((beat) => (beat === target ? { ...beat, resolved: true } : beat));
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function BeatTap() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [leftSec, setLeftSec] = useState(0);
  const [flash, setFlash] = useState<Flash>(null);
  const [pulse, setPulse] = useState(0);
  const [music, setMusic] = useState<SiteMusicSnapshot>({
    playing: false,
    title: "",
    artist: "",
  });
  const [reduced, setReduced] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const pendingRef = useRef<PendingBeat[]>([]);
  const endAtRef = useRef(0);
  const rafRef = useRef(0);
  const flashTimerRef = useRef(0);
  const musicPlayingRef = useRef(false);

  const setPhaseSafe = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(BEST_KEY);
        if (raw) setBest(Number(raw) || 0);
      } catch {
        /* private mode */
      }
      const snap = getSiteMusicSnapshot();
      setMusic(snap);
      musicPlayingRef.current = snap.playing;
      setReduced(prefersReducedMotion());
    });
    const unsubMusic = subscribeSiteMusic((next) => {
      setMusic(next);
      musicPlayingRef.current = next.playing;
      if (!next.playing && phaseRef.current === "playing") {
        setPhaseSafe("paused-music");
      }
      if (next.playing && phaseRef.current === "paused-music") {
        setPhaseSafe("playing");
      }
    });
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setReduced(mq.matches);
    mq.addEventListener("change", syncReduced);
    return () => {
      cancelled = true;
      unsubMusic();
      mq.removeEventListener("change", syncReduced);
      window.cancelAnimationFrame(rafRef.current);
      window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const finish = useCallback((finalScore: number) => {
    window.cancelAnimationFrame(rafRef.current);
    pendingRef.current = [];
    setPhaseSafe("done");
    setLeftSec(0);
    setBest((prev) => {
      const next = Math.max(prev, finalScore);
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  }, []);

  const showFlash = (kind: Flash) => {
    setFlash(kind);
    window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlash(null), 220);
  };

  const registerHit = () => {
    comboRef.current += 1;
    const gain = BEAT_SCORE + Math.min(Math.max(comboRef.current - 1, 0), 5);
    scoreRef.current += gain;
    setCombo(comboRef.current);
    setScore(scoreRef.current);
    showFlash("hit");
  };

  const registerMiss = () => {
    comboRef.current = 0;
    setCombo(0);
    showFlash("miss");
  };

  useEffect(() => {
    if (phase !== "playing" && phase !== "paused-music") return;

    const unsubBeats = subscribeBeats((t, energy) => {
      if (phaseRef.current !== "playing") return;
      pendingRef.current.push({ t, resolved: false });
      if (!prefersReducedMotion()) {
        setPulse(Math.min(1, 0.35 + energy * 0.9));
      }
    });

    const loop = () => {
      const now = performance.now();
      if (now >= endAtRef.current) {
        finish(scoreRef.current);
        return;
      }
      setLeftSec(Math.max(0, Math.ceil((endAtRef.current - now) / 1000)));

      if (phaseRef.current === "playing") {
        let pending = pendingRef.current;
        for (const beat of pendingRef.current) {
          if (beat.resolved) continue;
          if (now - beat.t > HIT_WINDOW_MS) {
            pending = markResolved(pending, beat);
            registerMiss();
          }
        }
        pendingRef.current = pending.filter(
          (b) => !b.resolved && now - b.t <= HIT_WINDOW_MS + 80,
        );
      }

      setPulse((p) => (p > 0.02 ? p * 0.86 : 0));
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      unsubBeats();
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [phase, finish]);

  const start = () => {
    if (!musicPlayingRef.current) return;
    scoreRef.current = 0;
    comboRef.current = 0;
    pendingRef.current = [];
    setScore(0);
    setCombo(0);
    setFlash(null);
    endAtRef.current = performance.now() + ROUND_MS;
    setLeftSec(Math.ceil(ROUND_MS / 1000));
    setPhaseSafe("playing");
  };

  const onTap = () => {
    const p = phaseRef.current;
    if (p === "idle" || p === "done") {
      start();
      return;
    }
    if (p === "paused-music") return;
    if (p !== "playing") return;

    const now = performance.now();
    let bestBeat: PendingBeat | null = null;
    let bestDist = Infinity;
    for (const beat of pendingRef.current) {
      if (beat.resolved) continue;
      const dist = Math.abs(now - beat.t);
      if (dist <= HIT_WINDOW_MS && dist < bestDist) {
        bestDist = dist;
        bestBeat = beat;
      }
    }
    if (bestBeat) {
      pendingRef.current = markResolved(pendingRef.current, bestBeat);
      registerHit();
    } else {
      registerMiss();
    }
  };

  const musicHint = music.playing
    ? music.title
      ? `正在播放 · ${music.title}${music.artist ? ` / ${music.artist}` : ""}`
      : "音乐播放中"
    : "请先在上方 MUSIC 开始播放";

  let padLabel = "开始";
  if (phase === "playing") padLabel = "点节拍";
  else if (phase === "paused-music") padLabel = "音乐暂停 · 请继续播放";
  else if (phase === "done") padLabel = "再来一次";

  const ringScale = reduced ? 1 : 1 + pulse * 0.28;
  const ringOpacity = reduced ? 0.15 : 0.18 + pulse * 0.55;

  return (
    <article className="widget-card beat-tap">
      <div className="widget-head">
        <span className="eyebrow">小游戏</span>
        <span className="beat-tap-best">{best > 0 ? `最佳 ${best}` : "听潮"}</span>
      </div>
      <p className="beat-tap-title">听潮 · 点节拍</p>
      <p className="beat-tap-hint" title={musicHint}>
        {musicHint}
      </p>

      {phase === "playing" || phase === "paused-music" ? (
        <div className="beat-tap-score-row" aria-live="polite">
          <span>
            得分 <b>{score}</b>
          </span>
          <span>
            连击 <b>{combo}</b>
          </span>
          <span>
            <b>{leftSec}</b>s
          </span>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="beat-tap-end" aria-live="polite">
          <p>
            本局 <b>{score}</b>
            {best > 0 ? ` · 最佳 ${best}` : ""}
          </p>
        </div>
      ) : null}

      <div className="beat-tap-stage">
        <span
          className="beat-tap-ring"
          aria-hidden
          style={{
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
          }}
        />
        <button
          type="button"
          className={`beat-tap-pad${flash === "hit" ? " is-hit" : ""}${flash === "miss" ? " is-miss" : ""}${phase === "paused-music" ? " is-paused" : ""}`}
          onPointerDown={(e) => {
            e.preventDefault();
            onTap();
          }}
          onKeyDown={(e) => {
            if (e.code === "Space" || e.key === " ") {
              e.preventDefault();
              onTap();
            }
          }}
          aria-label="听潮点节拍面板，空格或点击打拍"
          disabled={phase === "idle" && !music.playing}
        >
          <strong className="beat-tap-label">{padLabel}</strong>
          {phase === "idle" && !music.playing ? (
            <span className="beat-tap-cta">先点上方 MUSIC 播放</span>
          ) : null}
        </button>
      </div>
    </article>
  );
}
