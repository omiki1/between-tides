"use client";

import { useEffect, useRef, useState } from "react";

const ROUNDS = 5;
const WAIT_MIN_MS = 1200;
const WAIT_MAX_MS = 4800;
const BEST_KEY = "between-tides.reaction.best";

type Phase = "idle" | "waiting" | "ready" | "result" | "early" | "done";

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function ReactionTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState(0);
  const [best, setBest] = useState(0);
  const timerRef = useRef(0);
  const greenAtRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const roundRef = useRef(0);
  const timesRef = useRef<number[]>([]);

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
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const setPhaseSafe = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const scheduleGreen = () => {
    window.clearTimeout(timerRef.current);
    setPhaseSafe("waiting");
    const delay = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    timerRef.current = window.setTimeout(() => {
      greenAtRef.current = performance.now();
      setPhaseSafe("ready");
    }, delay);
  };

  const start = () => {
    window.clearTimeout(timerRef.current);
    timesRef.current = [];
    setTimes([]);
    setLastMs(0);
    roundRef.current = 1;
    setRound(1);
    scheduleGreen();
  };

  const finishAll = (finalTimes: number[]) => {
    setPhaseSafe("done");
    const mean = avg(finalTimes);
    setBest((prev) => {
      const next = prev > 0 ? Math.min(prev, mean) : mean;
      try {
        localStorage.setItem(BEST_KEY, String(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  const onPad = () => {
    const p = phaseRef.current;
    if (p === "idle" || p === "done") {
      start();
      return;
    }
    if (p === "waiting") {
      window.clearTimeout(timerRef.current);
      setPhaseSafe("early");
      return;
    }
    if (p === "early") {
      scheduleGreen();
      return;
    }
    if (p === "ready") {
      const ms = Math.max(1, Math.round(performance.now() - greenAtRef.current));
      const nextTimes = [...timesRef.current, ms];
      timesRef.current = nextTimes;
      setTimes(nextTimes);
      setLastMs(ms);
      if (nextTimes.length >= ROUNDS) {
        finishAll(nextTimes);
        return;
      }
      setPhaseSafe("result");
      return;
    }
    if (p === "result") {
      const n = roundRef.current + 1;
      roundRef.current = n;
      setRound(n);
      scheduleGreen();
    }
  };

  const mean = avg(times);
  let label = "点击开始";
  if (phase === "waiting") label = "等待变绿…";
  else if (phase === "ready") label = "点击！";
  else if (phase === "early") label = "太早了！再点继续";
  else if (phase === "result") label = `${lastMs} ms · 点继续`;
  else if (phase === "done") label = `平均 ${mean} ms · 再来一次`;

  const tone =
    phase === "waiting" || phase === "early"
      ? "is-red"
      : phase === "ready"
        ? "is-green"
        : phase === "done" || phase === "result"
          ? "is-done"
          : "is-idle";

  const roundText =
    phase === "idle" || phase === "done"
      ? `共 ${ROUNDS} 轮`
      : `第 ${Math.min(round, ROUNDS)} / ${ROUNDS} 轮`;

  const bestText = best > 0 ? `最佳 ${best} ms` : `${ROUNDS} 轮`;

  return (
    <article className="widget-card reaction-test">
      <div className="widget-head">
        <span className="eyebrow">小游戏</span>
        <span className="reaction-best">{bestText}</span>
      </div>
      <p className="reaction-hint">反应力 · 红变绿再点</p>
      <button
        type="button"
        className={`reaction-pad ${tone}`}
        onPointerDown={(e) => {
          e.preventDefault();
          onPad();
        }}
        aria-label="反应力测试面板"
      >
        <span className="reaction-round">{roundText}</span>
        <strong className="reaction-label">{label}</strong>
        {phase === "done" && times.length > 0 ? (
          <ul className="reaction-list" aria-label="各轮成绩">
            {times.map((t, i) => (
              <li key={i}>
                #{i + 1} <b>{t}</b> ms
              </li>
            ))}
          </ul>
        ) : null}
      </button>
    </article>
  );
}
