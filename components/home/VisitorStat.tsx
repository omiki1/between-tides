"use client";
import { useEffect, useSyncExternalStore } from "react";
import { ensureVisitRecorded, getVisitTotal, getVisitTotalServer, subscribeVisits } from "@/lib/visits";

export function VisitorStat() {
  useEffect(() => { void ensureVisitRecorded(); }, []);
  const total = useSyncExternalStore(subscribeVisits, getVisitTotal, getVisitTotalServer);
  return (
    <div className="visit-stat">
      <dt>访客</dt>
      {/* 数字在浏览器里请求后才到：dd 预留宽度（firefly.css），占位和数字用不同 key 的 span，
          换成新节点而不是改写同一个文本节点，右对齐时不算布局偏移 */}
      <dd aria-live="polite">{total == null ? <span key="pending">—</span> : <span key="total">{total.toLocaleString("zh-CN")}</span>}</dd>
    </div>
  );
}
