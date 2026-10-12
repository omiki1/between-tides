"use client";
import { usePathname } from "next/navigation";
import { NightFullBody } from "./NightFullBody";
import "@/styles/zzz.css";

/** 首页页脚：柏妮思站在「本年 / 本月 / 本周」时间条左上方（仅首页、夜间、>=981px）。 */
export function HomeTailArt() {
  const path = usePathname();
  if (path !== "/") return null;
  return <NightFullBody name="burnice" minWidth={981} place="tail" />;
}