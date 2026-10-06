import { claimVoice, localDateSeed } from "@/lib/deniaVoices";

export type DeniaLine = { text: string; src?: string };

/**
 * 取一句达妮娅的台词（兼容旧调用方的签名）。
 *
 * 现在委托给共用台词池 lib/deniaVoices.ts 的 claimVoice：同一页面上不同位置不会撞同一句，
 * 同一天、同一位置在不被别处占用时总是同一句。只能在浏览器里调用（useEffect / 事件回调）；
 * React 组件里更推荐直接用 useDeniaVoice(slot, { seed: localDateSeed(now) })，它会在卸载时自动释放。
 */
export function getDeniaLine(slot: string, date: Date = new Date()): DeniaLine {
  const voice = claimVoice(slot, { seed: localDateSeed(date) });
  return { text: voice.text, src: voice.src };
}
