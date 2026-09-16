"use client";
import { useEffect, useSyncExternalStore } from "react";
import { ensureVisitRecorded, getVisitTotal, getVisitTotalServer, subscribeVisits } from "@/lib/visits";

export function VisitorStat() {
  useEffect(() => { void ensureVisitRecorded(); }, []);
  const total = useSyncExternalStore(subscribeVisits, getVisitTotal, getVisitTotalServer);
  return (
    <div className="visit-stat">
      <dt>访客</dt>
      <dd aria-live="polite">{total == null ? "—" : total.toLocaleString("zh-CN")}</dd>
    </div>
  );
}
