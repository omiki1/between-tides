"use client";
import { usePathname } from "next/navigation";
import { MusicPlayer } from "@/components/home/MusicPlayer";
export function MusicDock(){const pathname=usePathname();return <div className={pathname==="/"?"home-music-wrap container":"inner-music-wrap container"}><MusicPlayer/></div>}
