"use client";
import { useSyncExternalStore } from "react";

type Slice = { label: string; left: number; total: number; pct: number };

function subscribeClock() {
  return () => {};
}

function slices(now = new Date()): Slice[] {
  const y = now.getFullYear();
  const startYear = new Date(y, 0, 1).getTime();
  const endYear = new Date(y + 1, 0, 1).getTime();
  const startMonth = new Date(y, now.getMonth(), 1).getTime();
  const endMonth = new Date(y, now.getMonth() + 1, 1).getTime();
  const day = now.getDay() || 7;
  const startWeek = new Date(y, now.getMonth(), now.getDate() - (day - 1)).setHours(0, 0, 0, 0);
  const endWeek = startWeek + 7 * 86400000;
  const mk = (label: string, start: number, end: number): Slice => {
    const total = Math.max(1, Math.round((end - start) / 86400000));
    const elapsed = Math.min(total, Math.max(0, Math.round((now.getTime() - start) / 86400000)));
    const left = Math.max(0, total - elapsed);
    return { label, left, total, pct: Math.round((elapsed / total) * 100) };
  };
  return [
    mk("本年", startYear, endYear),
    mk("本月", startMonth, endMonth),
    mk("本周", startWeek, endWeek),
  ];
}

const SERVER_ROWS: Slice[] | null = null;
let clientRows: Slice[] | null = null;

function clientSlices() {
  if (!clientRows) clientRows = slices();
  return clientRows;
}

export function TimeProgress() {
  const rows = useSyncExternalStore(subscribeClock, clientSlices, () => SERVER_ROWS);
  if (!rows) return null;
  return (
    <div className="time-progress" aria-label="时间进度">
      {rows.map((r) => (
        <div key={r.label} className="time-progress__row">
          <div className="time-progress__meta">
            <span>{r.label}</span>
            <span>
              还剩 {r.left} / {r.total} 天 · {r.pct}%
            </span>
          </div>
          <div className="time-progress__track">
            <i style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}