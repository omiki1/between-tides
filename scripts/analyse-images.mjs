/**
 * Summarise uploaded images without human eyes: dominant colours, brightness, palette fit.
 *   node scripts/analyse-images.mjs <file...>
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/analyse-images.mjs <image...>");
  process.exit(2);
}

const toHex = (r, g, b) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

for (const file of files) {
  const image = sharp(file);
  const meta = await image.metadata();
  const { data, info } = await image.clone().resize({ width: 240, fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const buckets = new Map();
  let luminance = 0;
  let opaque = 0;
  let pinkish = 0;
  let bluish = 0;
  let transparent = 0;
  let edgeTransparency = 0;
  let edgeSamples = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      const onEdge = x < 3 || y < 3 || x > width - 4 || y > height - 4;
      if (onEdge) {
        edgeSamples += 1;
        if (a < 240) edgeTransparency += 1;
      }
      if (a < 16) {
        transparent += 1;
        continue;
      }
      opaque += 1;
      luminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
      bucket.r += r; bucket.g += g; bucket.b += b; bucket.n += 1;
      buckets.set(key, bucket);
      if (r > 150 && b > 140 && r > g + 12 && r >= b - 10) pinkish += 1;
      if (b > r + 10 && b > g + 4 && b > 70) bluish += 1;
    }
  }

  const dominant = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)
    .map((bucket) => `${toHex(Math.round(bucket.r / bucket.n), Math.round(bucket.g / bucket.n), Math.round(bucket.b / bucket.n))} ${((bucket.n / opaque) * 100).toFixed(0)}%`);

  console.log(`${path.basename(file)}`);
  console.log(`  ${meta.width}×${meta.height} ${meta.format} ${(fs.statSync(file).size / 1024).toFixed(0)}KB  alpha=${meta.hasAlpha}`);
  console.log(`  mean luminance ${(luminance / Math.max(1, opaque)).toFixed(1)}  fully transparent ${((transparent / (width * height)) * 100).toFixed(1)}%  border transparent ${((edgeTransparency / Math.max(1, edgeSamples)) * 100).toFixed(1)}%`);
  console.log(`  pink-ish pixels ${((pinkish / Math.max(1, opaque)) * 100).toFixed(1)}%  blue-ish pixels ${((bluish / Math.max(1, opaque)) * 100).toFixed(1)}%`);
  console.log(`  dominant: ${dominant.join("  |  ")}`);
  console.log("");
}
