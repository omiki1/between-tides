"use client";
import { useEffect, useSyncExternalStore } from "react";
import { ensureVisitRecorded, getVisitTotal, getVisitTotalServer, subscribeVisits } from "@/lib/visits";

export function FooterVisits() {
  useEffect(() => { void ensureVisitRecorded(); }, []);
  const total = useSyncExternalStore(subscribeVisits, getVisitTotal, getVisitTotalServer);
  if (total == null) return null;
  return <span className="footer-visits">已有 {total.toLocaleString("zh-CN")} 位访客路过</span>;
}
