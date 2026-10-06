/**
 * 达妮娅台词池：首页上多个位置（Hero 语录轮播、TimeGreeting、「今日达妮娅」卡片……）共用一份台词，
 * 并保证同一页面上任意两个位置不会同时显示同一句。
 *
 * 只在浏览器里调用（useEffect / 事件回调里）：站点是静态导出，按日期、时段的挑选必须发生在客户端，
 * 不能在构建期决定。服务端渲染时请先用一个占位/兜底文案，挂载后再 claim。
 *
 *   const v = claimVoice("daily", { seed: localDateSeed() });   // 同一天同一句（除非被别的位置占了）
 *   const v = claimVoice("hero", { advance: true });            // 轮播：跳到下一句没被别人占用的
 *   releaseVoice("daily");                                       // 组件卸载时释放
 */
import { useEffect, useState } from "react";
import raw from "@/data/denia-voices.json";

export type DeniaVoice = {
  id: string;
  title: string;
  text: string;
  src?: string;
  source?: string;
  /** 可选：适用时段（与 timeOfDayOf() 的返回值同名），缺省表示任何时段都可以 */
  time?: string[];
};

export type ClaimedVoice = {
  id: string;
  text: string;
  /** 小字说明，例如「达妮娅 · 滑翔·一」 */
  caption: string;
  /** 语音文件路径（如有） */
  src?: string;
  /** 在 deniaVoices 数组里的下标 */
  index: number;
};

export type ClaimOptions = {
  /** 时段：late-night / morning / forenoon / noon / afternoon / evening；台词带 time 标签时优先挑匹配的 */
  timeOfDay?: string;
  /** 确定性挑选的种子（如 localDateSeed()）；不给则按顺序取第一句空闲的 */
  seed?: string;
  /** 轮播用：从当前这句往后找下一句空闲的（忽略 seed） */
  advance?: boolean;
};

export const deniaVoices: readonly DeniaVoice[] = raw as DeniaVoice[];

const claims = new Map<string, number>(); // slot -> index
const listeners = new Set<() => void>();
const isBrowser = typeof window !== "undefined";

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return h >>> 0;
}

function toClaimed(index: number): ClaimedVoice {
  const v = deniaVoices[index];
  return { id: v.id, text: v.text, caption: `达妮娅 · ${v.title}`, src: v.src, index };
}

function takenByOthers(slot: string) {
  const taken = new Set<number>();
  for (const [other, index] of claims) if (other !== slot) taken.add(index);
  return taken;
}

/**
 * 为某个位置领取一句台词。
 * - 已经领过且没传 advance：原样返回（重复渲染/重复调用是稳定的）。
 * - 不会返回其他位置正在占用的台词；台词全被占满时才允许重复（台词数少于位置数的极端情况）。
 */
export function claimVoice(slot: string, opts: ClaimOptions = {}): ClaimedVoice {
  const total = deniaVoices.length;
  const current = claims.get(slot);
  if (current !== undefined && !opts.advance) return toClaimed(current);

  const taken = takenByOthers(slot);
  let pool = deniaVoices.map((_, i) => i).filter((i) => !taken.has(i));
  if (opts.advance && current !== undefined && pool.length > 1) pool = pool.filter((i) => i !== current);
  if (!pool.length) pool = deniaVoices.map((_, i) => i);

  if (opts.timeOfDay) {
    const matching = pool.filter((i) => deniaVoices[i].time?.includes(opts.timeOfDay!));
    if (matching.length) pool = matching;
  }

  let index: number;
  if (opts.advance) {
    const start = current ?? -1;
    index = pool.reduce((best, i) => {
      const d = (i - start + total) % total || total;
      const bd = (best - start + total) % total || total;
      return d < bd ? i : best;
    }, pool[0]);
  } else if (opts.seed) {
    index = pool[hash(`${opts.seed}|${slot}`) % pool.length];
  } else {
    index = pool[0];
  }

  if (isBrowser) {
    claims.set(slot, index);
    listeners.forEach((fn) => fn());
  }
  return toClaimed(index);
}

/** 组件卸载时调用，把台词还回池子 */
export function releaseVoice(slot: string) {
  if (claims.delete(slot)) listeners.forEach((fn) => fn());
}

/** 当前各位置占用情况（调试用） */
export function claimedVoices(): Record<string, string> {
  return Object.fromEntries([...claims].map(([slot, i]) => [slot, deniaVoices[i].id]));
}

/** 占用变化时回调；返回取消订阅函数 */
export function subscribeVoices(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** 浏览器本地日期种子，例如 "2026-10-06"（必须在客户端调用） */
export function localDateSeed(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** 与 TimeGreeting 一致的时段划分 */
export function timeOfDayOf(date = new Date()) {
  const h = date.getHours();
  return h < 6 ? "late-night" : h < 9 ? "morning" : h < 12 ? "forenoon" : h < 14 ? "noon" : h < 18 ? "afternoon" : "evening";
}

/**
 * React 封装：挂载后（浏览器里）领取，卸载时释放。opts 传 null 表示暂不领取（例如时钟还没就绪）。
 *   const line = useDeniaVoice("daily", now ? { seed: localDateSeed(now) } : null);
 */
export function useDeniaVoice(slot: string, opts: ClaimOptions | null): ClaimedVoice | null {
  const [voice, setVoice] = useState<ClaimedVoice | null>(null);
  const ready = opts !== null;
  const seed = opts?.seed;
  const timeOfDay = opts?.timeOfDay;
  useEffect(() => {
    if (!ready) return;
    releaseVoice(slot);
    const v = claimVoice(slot, { seed, timeOfDay });
    let live = true;
    queueMicrotask(() => { if (live) setVoice(v); });
    return () => { live = false; releaseVoice(slot); };
  }, [slot, ready, seed, timeOfDay]);
  return voice;
}
