"use client";
import { usePathname } from "next/navigation";
import { MusicPlayer } from "@/components/home/MusicPlayer";
export function MusicDock() {
  const pathname = usePathname();
  const wrap = pathname === "/" ? "home-music-wrap container" : "inner-music-wrap container";
  return <div className={wrap}><MusicPlayer /></div>;
}
