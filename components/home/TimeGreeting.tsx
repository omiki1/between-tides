"use client";
/** Adapted from Firefly / Aemeath TimeGreeting (MIT). */
import { useLocalClock } from "@/lib/use-local-clock";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";

const periods = [
  { id: "late-night", until: 6, message: "夜深了，早点休息！", Icon: Moon },
  { id: "morning", until: 9, message: "早上好，新的一天！", Icon: Sunrise },
  { id: "forenoon", until: 12, message: "上午好，充满活力！", Icon: Sun },
  { id: "noon", until: 14, message: "中午好，记得午休！", Icon: Sun },
  { id: "afternoon", until: 18, message: "下午好，继续加油！", Icon: Sun },
  { id: "evening", until: 24, message: "晚上好，放松一下！", Icon: Sunset },
];
const weeks = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function periodOf(hour: number) {
  return periods.find((item) => hour < item.until) ?? periods[5];
}

export function TimeGreeting() {
  const now = useLocalClock();
  const date = now ?? new Date(Date.UTC(2026, 8, 15, 13));
  const period = periodOf(date.getHours());
  const Icon = period.Icon;
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return (
    <article className="time-greeting" data-period={period.id}>
      <div className="time-greeting-info">
        <div>
          <p>{period.message}</p>
          <div className="time-greeting-meta">
            <time dateTime={clock}>{clock}</time>
            <div>
              <span>{weeks[date.getDay()]}</span>
              <b>{String(date.getDate()).padStart(2, "0")}<small>/{String(date.getMonth() + 1).padStart(2, "0")}</small></b>
            </div>
          </div>
        </div>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="time-greeting-image" role="img" aria-label="达妮娅舞台截景" />
    </article>
  );
}
