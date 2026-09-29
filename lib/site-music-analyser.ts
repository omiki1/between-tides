/** Beat helper for site music. Browser-only.

Never uses createMediaElementSource — QQ/cross-origin streams go silent once
piped through Web Audio without CORS. Emit a soft synthetic pulse while the
track is playing so BeatTap stays linked to music play/pause.
*/

import { emitBeat } from "@/lib/site-music-bus";

export type AnalyserHandle = {
  start: () => void;
  stop: () => void;
};

const SYNTH_BPM = 104;
const SYNTH_INTERVAL_MS = 60000 / SYNTH_BPM;

const handles = new WeakMap<HTMLAudioElement, AnalyserHandle>();

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function makeSyntheticHandle(): AnalyserHandle {
  let timer = 0;
  let running = false;
  return {
    start: () => {
      if (running || prefersReducedMotion()) return;
      running = true;
      const tick = () => {
        if (!running) return;
        emitBeat(performance.now(), 0.55);
        timer = window.setTimeout(tick, SYNTH_INTERVAL_MS);
      };
      timer = window.setTimeout(tick, SYNTH_INTERVAL_MS * 0.45);
    },
    stop: () => {
      running = false;
      if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    },
  };
}

/** Attach (once) a play-synced synthetic beat clock for this audio element. */
export function attachBeatAnalyser(audio: HTMLAudioElement): AnalyserHandle | null {
  if (typeof window === "undefined") return null;
  const existing = handles.get(audio);
  if (existing) return existing;
  const handle = makeSyntheticHandle();
  handles.set(audio, handle);
  return handle;
}

/** No-op kept for MusicPlayer call sites (no AudioContext in synthetic mode). */
export function resumeBeatAudioContext(_audio: HTMLAudioElement): void {
  /* synthetic mode has no AudioContext */
}
