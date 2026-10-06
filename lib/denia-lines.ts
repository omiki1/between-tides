import voices from "@/data/denia-voices.json";

export type DeniaLine = { text: string; src?: string };

/**
 * 取一句达妮娅的台词。
 *
 * 现在：从 data/denia-voices.json 里按「日期 + 位置」稳定地挑一句（同一天、同一位置总是同一句）。
 * 之后：ui师 会提供共用台词池，并保证同一屏不重复 —— 到时只需替换这个函数的实现，
 * 调用方（DeniaToday 等）不用改。slot 用来区分页面上的不同位置。
 */
export function getDeniaLine(slot: string, date: Date = new Date()): DeniaLine {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}:${slot}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
  const voice = voices[(hash >>> 0) % voices.length];
  return { text: voice.text, src: voice.src };
}
