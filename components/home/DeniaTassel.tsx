import { useId } from "react";

/** 达妮娅裙摆上的粉色流苏：纯 SVG 手绘，金色菱形结 + 粉色穗子。 */
export function DeniaTassel({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 16 42" width="12" height="32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-silk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--denia-tassel)" />
          <stop offset="1" stopColor="var(--denia-pink)" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e3c2" />
          <stop offset="1" stopColor="var(--denia-gold-deep)" />
        </linearGradient>
      </defs>
      <path d="M8 0V7" stroke={`url(#${id}-gold)`} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 5.5 11.2 9.6 8 13.7 4.8 9.6Z" fill={`url(#${id}-gold)`} />
      <path d="M6.2 14.4h3.6l3.5 23.4Q8 40.6 2.7 37.8Z" fill={`url(#${id}-silk)`} opacity=".92" />
      <path d="M7 15.5 5.4 37.6M8 15.5v23M9 15.5l1.6 22.1" stroke="rgba(255,255,255,.5)" strokeWidth=".6" strokeLinecap="round" />
      <rect x="5.6" y="14" width="4.8" height="1.8" rx=".9" fill={`url(#${id}-gold)`} />
    </svg>
  );
}
