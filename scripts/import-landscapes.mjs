/**
 * Import desktop「风景壁纸」JPGs (folder name may be mojibake) into public/gallery/landscapes.
 * Also encode official Denia mobile wallpaper 02 for the homepage.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const desktop = "C:/Users/freeing1/Desktop";
const destRoot = path.join(process.cwd(), "public/gallery/landscapes");
const deniaDest = path.join(process.cwd(), "public/assets/denia");
const quality = 82;
const maxWidth = 1920;

function findLandscapesRoot() {
  for (const name of fs.readdirSync(desktop)) {
    const full = path.join(desktop, name);
    if (!fs.statSync(full).isDirectory()) continue;
    if (name.includes("风景壁纸") || name.includes("澹佺焊") || name.includes("椋庢")) return full;
  }
  throw new Error("desktop landscape folder not found");
}

function classify(sub, files) {
  if (sub.includes("锋") || sub.includes("磱") || sub.includes("海港")) {
    return { slug: "harbor", title: "海港", english: "HARBOR" };
  }
  if (files.length === 3 || sub.includes("雪乡") || sub.includes("北")) {
    return { slug: "snow-village", title: "雪乡", english: "SNOW VILLAGE" };
  }
  if (sub.includes("妫") || sub.includes("\ue1bd") || sub.includes("枫")) {
    return { slug: "maple", title: "枫桥", english: "MAPLE BRIDGE" };
  }
  return { slug: "snow-field", title: "雪地", english: "SNOW FIELD" };
}

async function writeWebp(input, output, width) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(output);
  const info = await sharp(output).metadata();
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log(path.relative(process.cwd(), output), info.width, "x", info.height, kb + "kb");
  return { width: info.width, height: info.height, kb };
}

const root = findLandscapesRoot();
console.log("source", root);
const photos = [];

for (const sub of fs.readdirSync(root)) {
  const folder = path.join(root, sub);
  if (!fs.statSync(folder).isDirectory()) continue;
  const files = fs.readdirSync(folder).filter((file) => /\.jpe?g$/i.test(file)).sort();
  const album = classify(sub, files);
  let index = 1;
  for (const file of files) {
    const src = path.join(folder, file);
    const id = `${album.slug}-${String(index).padStart(2, "0")}`;
    const dest = path.join(destRoot, album.slug, `${String(index).padStart(2, "0")}.webp`);
    const meta = await writeWebp(src, dest, maxWidth);
    const mtime = fs.statSync(src).mtime;
    const date = `${mtime.getFullYear()}.${String(mtime.getMonth() + 1).padStart(2, "0")}.${String(mtime.getDate()).padStart(2, "0")}`;
    photos.push({
      id,
      src: `/gallery/landscapes/${album.slug}/${String(index).padStart(2, "0")}.webp`,
      title: `${album.title} ${String(index).padStart(2, "0")}`,
      english: `${album.english} ${String(index).padStart(2, "0")}`,
      location: `Between Tides · 风景壁纸 · ${album.title}`,
      date,
      width: meta.width,
      height: meta.height,
      album: album.slug,
    });
    index += 1;
  }
}

const celebrationSrc = path.join(desktop, "达妮娅-网站素材", "official-reference", "denia_wallpaper_mobile_02.png");
const celebrationDest = path.join(deniaDest, "hero/celebration.webp");
const celebration = await writeWebp(celebrationSrc, celebrationDest, 1080);

const out = {
  celebration: {
    id: "starlight-for-you",
    src: "/assets/denia/hero/celebration.webp",
    title: "群星，因你闪耀",
    english: "STARS SHINE FOR YOU",
    location: "Kuro Games 公开宣传图 · 鸣潮2 潮声庆典 · 个人非商业展示",
    date: "2026.09.15",
    width: celebration.width,
    height: celebration.height,
    album: "character",
  },
  landscapes: photos,
};
fs.writeFileSync(path.join(process.cwd(), "data/landscape-import.json"), JSON.stringify(out, null, 2));
console.log("wrote data/landscape-import.json", photos.length, "landscapes");
