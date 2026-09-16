"use client";
import { useEffect } from "react";
import { ensureVisitRecorded } from "@/lib/visits";

/** 整站进页记一次访客；同一会话不重复请求。 */
export function VisitRecorder() {
  useEffect(() => { void ensureVisitRecorded(); }, []);
  return null;
}
