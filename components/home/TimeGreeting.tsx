"use client";
/** Adapted from Firefly / Aemeath TimeGreeting (MIT). */
import { useLocalClock } from "@/lib/use-local-clock";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { claimVoice, releaseVoice, localDateSeed, type ClaimedVoice } from "@/lib/deniaVoices";

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
  const periodId = now ? period.id : null;
  const [voice, setVoice] = useState<ClaimedVoice | null>(null);
  /* 台词在浏览器里按「本地日期 + 时段」挑选，并与 Hero / 今日卡片互斥；时段变化时换一句 */
  useEffect(() => {
    if (!periodId) return;
    releaseVoice("time-greeting");
    const v = claimVoice("time-greeting", { timeOfDay: periodId, seed: `${localDateSeed()}|${periodId}` });
    let live = true;
    queueMicrotask(() => { if (live) setVoice(v); });
    return () => { live = false; releaseVoice("time-greeting"); };
  }, [periodId]);
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
          {/* 台词挂载后才在浏览器里挑（按本地日期 + 时段），这一行先占好位置再填字，免得下面的卡片被顶下去（追番页 CLS） */}
          <p className="time-greeting-voice" title={voice?.caption} aria-hidden={voice ? undefined : true} data-pending={voice ? undefined : ""}>{voice ? <>「{voice.text}」</> : "\u00a0"}</p>
        </div>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="time-greeting-image" role="img" aria-label="达妮娅舞台截景" />
    </article>
  );
}
