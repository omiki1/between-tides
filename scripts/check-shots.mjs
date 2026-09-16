/** Report basic pixel statistics for screenshots, so "the page rendered" is a measured fact. */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const directory = process.argv[2] ?? path.join(process.cwd(), ".research/shots");
const files = fs.readdirSync(directory).filter((file) => file.endsWith(".png")).sort();

/** Minimal PNG reader for 8-bit RGB/RGBA non-interlaced images (what Chrome emits). */
function readPng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  let position = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[position];
    position += 1;
    const line = raw.subarray(position, position + stride);
    position += stride;
    const start = y * stride;
    const prior = start - stride;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? pixels[start + x - channels] : 0;
      const up = y > 0 ? pixels[prior + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[prior + x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      pixels[start + x] = value & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

let failures = 0;
for (const file of files) {
  const image = readPng(fs.readFileSync(path.join(directory, file)));
  const { width, height, channels, pixels } = image;
  const colors = new Set();
  let luminanceSum = 0;
  let samples = 0;
  let pinkish = 0;
  let bluish = 0;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 40000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      colors.add((r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3));
      luminanceSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      samples += 1;
      if (r > 200 && b > 200 && g < r - 15) pinkish += 1;
      if (b > g && g > r + 8 && b > 90) bluish += 1;
    }
  }
  const average = luminanceSum / samples;
  /* The palette is deliberately restrained, so a page with little imagery yields few
     distinct colours; the meaningful signals are non-trivial luminance variety and a
     page tall enough to hold real content. */
  const ok = width >= 300 && height >= 600 && colors.size > 120 && average > 6 && average < 250;
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"}  ${file.padEnd(20)} ${width}×${height}  distinct=${String(colors.size).padStart(5)}  meanLuma=${average.toFixed(1)}  palette pink=${(pinkish / samples * 100).toFixed(2)}% blue=${(bluish / samples * 100).toFixed(2)}%`);
}
console.log(failures ? `\n${failures} screenshot(s) look blank or broken.` : `\nAll ${files.length} screenshots contain rendered content.`);
process.exit(failures ? 1 : 0);
