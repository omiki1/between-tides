"use client";
import { useMemo } from "react";
import { useLocalClock } from "@/lib/use-local-clock";

const week = ["日", "一", "二", "三", "四", "五", "六"];

export function CalendarCard() {
  const now = useLocalClock();
  const calendar = useMemo(() => {
    const date = now ?? new Date(Date.UTC(2026, 8, 15));
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = now ? now.getDate() : -1;
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    return { year, month, today, cells };
  }, [now]);

  return (
    <article className="widget-card calendar-card" aria-label="本月日历">
      <span className="eyebrow">
        {calendar.year}.{String(calendar.month + 1).padStart(2, "0")}
      </span>
      <div className="calendar-grid">
        {week.map((day) => (
          <span key={day} className="calendar-week">
            {day}
          </span>
        ))}
        {calendar.cells.map((day, index) => (
          <span key={index} className={day === calendar.today ? "calendar-today" : undefined}>
            {day ?? ""}
          </span>
        ))}
      </div>
    </article>
  );
}
