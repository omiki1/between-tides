"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Leaf, Sparkles } from "lucide-react";
import {
  AMBIANCE_EVENT,
  type AmbiancePrefs,
  type MotionMode,
  type SakuraDensity,
  getAmbianceSnapshot,
  getAmbianceServerSnapshot,
  writeAmbiance,
} from "./ambiance";

const DENSITY_LABEL: Record<SakuraDensity, string> = {
  off: "关",
  soft: "柔",
  full: "满",
};

const DENSITY_CYCLE: SakuraDensity[] = ["off", "soft", "full"];

function subscribeAmbiance(onStoreChange: () => void) {
  window.addEventListener(AMBIANCE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(AMBIANCE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function AmbianceSwitch() {
  const prefs = useSyncExternalStore(subscribeAmbiance, getAmbianceSnapshot, getAmbianceServerSnapshot);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      document.documentElement.dataset.ambianceMotion = prefs.motion;
      document.documentElement.dataset.ambianceDensity = prefs.density;
    } catch { /* ignore */ }
  }, [prefs.motion, prefs.density]);

  const commit = useCallback((next: AmbiancePrefs) => {
    writeAmbiance(next);
  }, []);

  const cycleDensity = () => {
    const i = DENSITY_CYCLE.indexOf(prefs.density);
    commit({ ...prefs, density: DENSITY_CYCLE[(i + 1) % DENSITY_CYCLE.length]! });
  };

  const setMotion = (motion: MotionMode) => commit({ ...prefs, motion });

  return (
    <div className={`ambiance-switch${open ? " open" : ""}`}>
      <button
        type="button"
        className="ambiance-trigger"
        aria-label="氛围设置：樱花密度与动效"
        aria-expanded={open}
        aria-haspopup="true"
        title="氛围"
        onClick={() => setOpen((v) => !v)}
      >
        <Sparkles size={14} aria-hidden />
        <span className="ambiance-trigger-label">氛围</span>
      </button>
      {open ? (
        <div className="ambiance-popover" role="dialog" aria-label="氛围设置">
          <div className="ambiance-row">
            <span><Leaf size={12} aria-hidden /> 樱花</span>
            <button type="button" className="ambiance-chip" onClick={cycleDensity} aria-label={`樱花密度：${DENSITY_LABEL[prefs.density]}`}>
              {DENSITY_LABEL[prefs.density]}
            </button>
          </div>
          <div className="ambiance-row ambiance-motion">
            <span>动效</span>
            <div className="ambiance-segment" role="group" aria-label="减弱动效">
              {(
                [
                  ["system", "跟随"],
                  ["reduce", "减弱"],
                  ["allow", "始终"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={prefs.motion === value}
                  onClick={() => setMotion(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="ambiance-hint">减弱动效会暂停樱花与较重动画</p>
        </div>
      ) : null}
    </div>
  );
}
