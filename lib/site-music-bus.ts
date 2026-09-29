/** Browser-only site music / beat bus. Safe to import on the server (no window at module load). */

export type SiteMusicSnapshot = {
  playing: boolean;
  title: string;
  artist: string;
};

type MusicListener = (snap: SiteMusicSnapshot) => void;
type BeatListener = (t: number, energy: number) => void;

let snapshot: SiteMusicSnapshot = { playing: false, title: "", artist: "" };
const musicListeners = new Set<MusicListener>();
const beatListeners = new Set<BeatListener>();

export function getSiteMusicSnapshot(): SiteMusicSnapshot {
  return snapshot;
}

export function publishSiteMusic(partial: Partial<SiteMusicSnapshot>): void {
  snapshot = { ...snapshot, ...partial };
  musicListeners.forEach((cb) => cb(snapshot));
}

export function subscribeSiteMusic(cb: MusicListener): () => void {
  musicListeners.add(cb);
  return () => {
    musicListeners.delete(cb);
  };
}

export function emitBeat(t: number, energy: number): void {
  beatListeners.forEach((cb) => cb(t, energy));
}

export function subscribeBeats(cb: BeatListener): () => void {
  beatListeners.add(cb);
  return () => {
    beatListeners.delete(cb);
  };
}
