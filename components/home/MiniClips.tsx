"use client";

import { useEffect, useRef } from "react";

export function MiniClips({
  src,
  position = "center 42%",
}: {
  src: string;
  position?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onReady = () => {
      if (reduced) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };
    video.addEventListener("canplay", onReady);
    video.load();
    return () => video.removeEventListener("canplay", onReady);
  }, [src]);
  return (
    <div className="mini-clips" aria-label="小循环画面">
      <div className="mini-clip">
        <video
          ref={ref}
          className="mini-clip-video"
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{ objectPosition: position }}
        />
      </div>
    </div>
  );
}
