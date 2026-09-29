"use client";

import { useId } from "react";

const MOTES = [
  { left: "8%", top: "38%", size: 4, dur: "11s", dx: "10px", delay: "0s" },
  { left: "18%", top: "55%", size: 3, dur: "13s", dx: "-8px", delay: "1.2s" },
  { left: "32%", top: "28%", size: 5, dur: "12s", dx: "14px", delay: "0.6s" },
  { left: "48%", top: "60%", size: 3, dur: "14s", dx: "-12px", delay: "2s" },
  { left: "62%", top: "32%", size: 4, dur: "10.5s", dx: "9px", delay: "0.3s" },
  { left: "74%", top: "52%", size: 3, dur: "15s", dx: "-10px", delay: "1.8s" },
  { left: "86%", top: "36%", size: 4, dur: "12.5s", dx: "11px", delay: "0.9s" },
  { left: "94%", top: "58%", size: 2.5, dur: "13.5s", dx: "-6px", delay: "2.4s" },
] as const;

/** Named palettes: `main` paints dashes, `gap` fills the blank segments between them. */
export const TIDE_PALETTES = {
  aurora: {
    main: ["#ff8fb0", "#b9a6ff", "#6aafff"],
    gap: ["#7ef0d4", "#9ad0ff", "#ffc6e0"],
  },
  dusk: {
    main: ["#ff9a6b", "#e88cff", "#6ec8ff"],
    gap: ["#ffe08a", "#ff8ec8", "#8ab4ff"],
  },
  tide: {
    main: ["#6aafff", "#b9a6ff", "#ff8fb0"],
    gap: ["#a8f0ff", "#d4b8ff", "#ffb8d0"],
  },
  mist: {
    main: ["#c4b5fd", "#93c5fd", "#f9a8d4"],
    gap: ["#99f6e4", "#fde68a", "#a5b4fc"],
  },
} as const;

export type TidePalette = keyof typeof TIDE_PALETTES;

type TideDividerProps = {
  tone?: "section" | "footer";
  /** Color set for dash + blank-gap segments. Default: aurora (section) / tide (footer). */
  palette?: TidePalette;
  /** Optional override stops for the dash stroke (3 colors). */
  mainColors?: readonly [string, string, string];
  /** Optional override stops for blank-gap segments (3 colors). */
  gapColors?: readonly [string, string, string];
};

const PATH_ECHO =
  "M0 40 L24 40 L36 22 L48 52 L60 28 L72 48 L90 14 L108 58 L126 24 L144 50 L162 18 L180 54 L198 30 L216 46 L240 8 L264 62 L288 20 L312 56 L336 26 L360 50 L384 12 L408 60 L432 28 L456 48 L480 16 L504 58 L528 22 L552 52 L576 30 L600 46 L624 10 L648 60 L672 24 L696 54 L720 18 L744 56 L768 28 L792 48 L816 12 L840 60 L864 22 L888 52 L912 26 L936 50 L960 14 L984 58 L1008 20 L1032 54 L1056 30 L1080 46 L1104 10 L1128 62 L1152 24 L1176 52 L1200 18 L1224 56 L1248 28 L1272 48 L1296 14 L1320 58 L1344 26 L1368 46 L1392 32 L1416 44 L1440 40";
const PATH_MAIN =
  "M0 40 L24 40 L36 18 L48 56 L60 24 L72 52 L90 10 L108 64 L126 20 L144 54 L162 14 L180 58 L198 26 L216 50 L240 4 L264 68 L288 16 L312 60 L336 22 L360 54 L384 8 L408 66 L432 24 L456 52 L480 12 L504 62 L528 18 L552 56 L576 26 L600 50 L624 6 L648 66 L672 20 L696 58 L720 14 L744 60 L768 24 L792 52 L816 8 L840 66 L864 18 L888 56 L912 22 L936 54 L960 10 L984 64 L1008 16 L1032 58 L1056 26 L1080 50 L1104 6 L1128 68 L1152 20 L1176 56 L1200 14 L1224 60 L1248 24 L1272 52 L1296 10 L1320 64 L1344 22 L1368 50 L1392 28 L1416 46 L1440 40";
const PATH_FINE =
  "M0 40 L30 40 L42 28 L54 48 L70 20 L86 52 L110 16 L130 56 L150 24 L170 50 L200 12 L230 60 L260 22 L290 54 L320 18 L350 52 L380 14 L410 58 L440 26 L470 48 L500 16 L530 56 L560 22 L590 50 L620 12 L650 60 L680 20 L710 54 L740 16 L770 56 L800 24 L830 50 L860 14 L890 58 L920 22 L950 52 L980 12 L1010 60 L1040 20 L1070 54 L1100 16 L1130 58 L1160 24 L1190 50 L1220 14 L1250 56 L1280 22 L1310 52 L1340 18 L1370 48 L1400 30 L1420 44 L1440 40";

function GradientStops({ colors }: { colors: readonly [string, string, string] }) {
  return (
    <>
      <stop offset="0%" stopColor={colors[0]} />
      <stop offset="50%" stopColor={colors[1]} />
      <stop offset="100%" stopColor={colors[2]} />
    </>
  );
}

/** Pastel tacet / sound-wave mark. Blank dash gaps get a second palette. */
export function TideDivider({
  tone = "section",
  palette,
  mainColors,
  gapColors,
}: TideDividerProps) {
  const footer = tone === "footer";
  const uid = useId().replace(/:/g, "");
  const gid = `tw-main-${uid}`;
  const gapGid = `tw-gap-${uid}`;
  const fid = `tw-glow-${uid}`;

  const key = palette ?? (footer ? "tide" : "aurora");
  const preset = TIDE_PALETTES[key];
  const main = (mainColors ?? preset.main) as readonly [string, string, string];
  const gap = (gapColors ?? preset.gap) as readonly [string, string, string];

  return (
    <div
      className={`tide-divider tide-divider--${tone}`}
      aria-hidden="true"
      data-palette={key}
    >
      <div className="tide-motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="tide-mote"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              ["--dur" as string]: m.dur,
              ["--dx" as string]: m.dx,
              animationDelay: m.delay,
            }}
          />
        ))}
      </div>
      <svg
        className="tide-wave"
        viewBox={footer ? "0 0 1440 90" : "0 0 1440 80"}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="50%" x2="1440" y2="50%" gradientUnits="userSpaceOnUse">
            <GradientStops colors={main} />
          </linearGradient>
          <linearGradient id={gapGid} x1="0" y1="50%" x2="1440" y2="50%" gradientUnits="userSpaceOnUse">
            <GradientStops colors={gap} />
          </linearGradient>
          <filter id={fid} x="-5%" y="-80%" width="110%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="tide-wave__drift">
          <path className="tide-wave__echo" d={PATH_ECHO} stroke={`url(#${gid})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="tide-wave__echo tide-wave__gap" d={PATH_ECHO} stroke={`url(#${gapGid})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="tide-wave__main" d={PATH_MAIN} stroke={`url(#${gid})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${fid})`} />
          <path className="tide-wave__main tide-wave__gap" d={PATH_MAIN} stroke={`url(#${gapGid})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path className="tide-wave__fine" d={PATH_FINE} stroke={`url(#${gid})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path className="tide-wave__fine tide-wave__gap" d={PATH_FINE} stroke={`url(#${gapGid})`} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <g className="tide-wave__rings" stroke={`url(#${gid})`} fill="none" opacity="0.7">
            <circle className="tide-wave__ring" cx="240" cy="40" r="13" strokeWidth="1.1" />
            <circle className="tide-wave__ring tide-wave__ring--delay" cx="240" cy="40" r="6" strokeWidth="0.85" />
            <circle className="tide-wave__ring" cx="720" cy="40" r="11" strokeWidth="1" />
            <circle className="tide-wave__ring tide-wave__ring--delay" cx="720" cy="40" r="4.5" strokeWidth="0.75" />
            <circle className="tide-wave__ring" cx="1128" cy="40" r="12" strokeWidth="1" />
            <circle className="tide-wave__ring tide-wave__ring--delay" cx="1128" cy="40" r="5" strokeWidth="0.8" />
          </g>
        </g>
      </svg>
    </div>
  );
}
