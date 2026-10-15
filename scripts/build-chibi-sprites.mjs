// 把 art-src/chibi-rooms/animations/<name>/frames/00..07.png（512px、透明）合成 4x2 小雪碧图：
// public/art/chibi/<name>.webp（每格 192px）。首页 ChibiPet 用 CSS steps 播放。
// 用法：node scripts/build-chibi-sprites.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const NAMES = ["denia", "aemeath", "iuno", "lupa", "jinhsi", "phrolova", "phoebe"];
const CELL = 192, COLS = 4, ROWS = 2;
const src = "art-src/chibi-rooms/animations";
const out = "public/art/chibi";
fs.mkdirSync(out, { recursive: true });

for (const name of NAMES) {
  const layers = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const file = path.join(src, name, "frames", `${String(i).padStart(2, "0")}.png`);
    const buf = await sharp(file).resize(CELL, CELL, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    layers.push({ input: buf, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL });
  }
  const dest = path.join(out, `${name}.webp`);
  await sharp({ create: { width: CELL * COLS, height: CELL * ROWS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers)
    .webp({ quality: 78, alphaQuality: 80, effort: 6 })
    .toFile(dest);
  console.log(name, Math.round(fs.statSync(dest).size / 1024) + "KB");
}