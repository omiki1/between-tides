/**
 * 「今日达妮娅」的图池：全部是《鸣潮》官方宣传图（库洛游戏）的 4:5 小裁切，未重绘。
 * 每张 240w / 480w 两档，裁切坐标记在 docs/ASSET_SOURCES.md。
 * 按浏览器里的当天日期轮换（components/home/DeniaToday.tsx），不在构建时挑。
 */
export type DeniaTodayArt = { id: string; alt: string; credit: string };

export const deniaTodayArt: DeniaTodayArt[] = [
  { id: "stagecraft", alt: "达妮娅官方角色立绘，粉发白裙，红手套轻抬", credit: "鸣潮角色资料图" },
  { id: "portrait", alt: "达妮娅的官方头像特写，带着浅浅的笑", credit: "鸣潮角色资料图" },
  { id: "curtain", alt: "红色帷幕前持杖的达妮娅", credit: "鸣潮角色宣传图" },
  { id: "name", alt: "倒映在碎镜与泡泡之间的达妮娅", credit: "鸣潮 2 周年 · 潮声庆典壁纸" },
  { id: "party", alt: "吹着泡泡的达妮娅，派对倒计时宣传图", credit: "鸣潮 2 周年宣传图" },
  { id: "peace", alt: "比着剪刀手的达妮娅", credit: "鸣潮 2 周年 · 潮声庆典宣传图" },
  { id: "cage", alt: "暖色光里侧脸微笑的达妮娅", credit: "鸣潮 2 周年壁纸" },
];

export const deniaTodaySrc = (id: string, width: 240 | 480) => `/artwork/denia/today/${id}-${width}.webp`;
