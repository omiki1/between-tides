/** Ambiance prefs: sakura density + motion override. localStorage key between-tides.ambiance.v1 */
export const AMBIANCE_KEY = "between-tides.ambiance.v1";
export const AMBIANCE_EVENT = "between-tides:ambiance";

export type SakuraDensity = "off" | "soft" | "full";
export type MotionMode = "system" | "reduce" | "allow";

export type AmbiancePrefs = {
  density: SakuraDensity;
  motion: MotionMode;
};

export const DEFAULT_AMBIANCE: AmbiancePrefs = { density: "full", motion: "system" };

export function readAmbiance(): AmbiancePrefs {
  if (typeof window === "undefined") return DEFAULT_AMBIANCE;
  try {
    const raw = window.localStorage.getItem(AMBIANCE_KEY);
    if (!raw) return DEFAULT_AMBIANCE;
    const parsed = JSON.parse(raw) as Partial<AmbiancePrefs>;
    const density = parsed.density === "off" || parsed.density === "soft" || parsed.density === "full"
      ? parsed.density : DEFAULT_AMBIANCE.density;
    const motion = parsed.motion === "system" || parsed.motion === "reduce" || parsed.motion === "allow"
      ? parsed.motion : DEFAULT_AMBIANCE.motion;
    return { density, motion };
  } catch {
    return DEFAULT_AMBIANCE;
  }
}

/** Cached snapshot for useSyncExternalStore — must return stable ref when values unchanged. */
let cachedSnapshot: AmbiancePrefs = DEFAULT_AMBIANCE;

export function getAmbianceSnapshot(): AmbiancePrefs {
  const next = readAmbiance();
  if (
    cachedSnapshot.density === next.density &&
    cachedSnapshot.motion === next.motion
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return cachedSnapshot;
}

export function getAmbianceServerSnapshot(): AmbiancePrefs {
  return DEFAULT_AMBIANCE;
}

export function writeAmbiance(prefs: AmbiancePrefs) {
  cachedSnapshot = prefs;
  try {
    window.localStorage.setItem(AMBIANCE_KEY, JSON.stringify(prefs));
  } catch { /* private mode */ }
  try {
    document.documentElement.dataset.ambianceMotion = prefs.motion;
    document.documentElement.dataset.ambianceDensity = prefs.density;
  } catch { /* SSR */ }
  window.dispatchEvent(new CustomEvent(AMBIANCE_EVENT, { detail: prefs }));
}

/** Day/night particle counts for density presets. */
export function sakuraCounts(density: SakuraDensity, night: boolean): number {
  if (density === "off") return 0;
  if (density === "soft") return night ? 40 : 18;
  return night ? 78 : 36;
}

export function shouldReduceMotion(motion: MotionMode, systemReduce: boolean): boolean {
  if (motion === "reduce") return true;
  if (motion === "allow") return false;
  return systemReduce;
}
