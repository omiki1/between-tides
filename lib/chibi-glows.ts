/*
 * 每个 Q 版小房间里「真的会发光」的东西（灯、屏幕、灯笼……）的位置，单位是小人盒子的百分比，
 * 只在夜间画一小团柔光（见 styles/chibi.css）。没有光源的东西不发光。
 * kind: lamp = 暖色缓慢呼吸；screen = 冷色轻微闪烁。size = 光斑直径占盒子宽度的百分比。
 */
export type ChibiGlow = { x: number; y: number; size: number; kind: "lamp" | "screen" };

export const CHIBI_GLOWS: Record<string, ChibiGlow[]> = {
  denia: [{ x: 82, y: 28, size: 17, kind: "lamp" }], // 墙上的泡泡灯
  aemeath: [
    { x: 43, y: 16, size: 14, kind: "lamp" }, // 窗边挂着的星星灯
    { x: 78, y: 36, size: 17, kind: "screen" }, // 电视屏幕
    { x: 87, y: 54, size: 14, kind: "lamp" }, // 柜子上的星星灯
  ],
  iuno: [
    { x: 66, y: 20, size: 15, kind: "lamp" }, // 壁灯
    { x: 88, y: 37, size: 17, kind: "lamp" }, // 球形台灯
    { x: 87, y: 69, size: 15, kind: "lamp" }, // 地上的灯笼
  ],
  lupa: [
    { x: 17, y: 28, size: 13, kind: "lamp" }, // 窗帘旁的小灯笼
    { x: 91, y: 52, size: 16, kind: "lamp" }, // 肉球球灯
  ],
  jinhsi: [{ x: 90, y: 38, size: 16, kind: "lamp" }], // 墙边的宫灯
  phrolova: [{ x: 83, y: 22, size: 15, kind: "lamp" }], // 钢琴上的台灯
  phoebe: [
    { x: 16, y: 38, size: 15, kind: "lamp" }, // 边桌台灯
    { x: 82, y: 43, size: 13, kind: "lamp" }, // 书架上的黄铜小灯
  ],
};