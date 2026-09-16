import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = "C:/Users/freeing1/Desktop/达妮娅-网站素材";
const dest = path.join(process.cwd(), "public/assets/denia");
const quality = 84;

async function write(image, file, width) {
  const target = path.join(dest, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  let pipeline = image.webp({ quality, effort: 4 });
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  await pipeline.toFile(target);
  const info = await sharp(target).metadata();
  console.log(file, info.width, "x", info.height, Math.round(fs.statSync(target).size / 1024) + "kb");
}

const official = path.join(src, "official-reference");
const generated = path.join(src, "generated");

const profile01 = sharp(path.join(official, "denia_official_profile_01.jpg"));
const profile02 = sharp(path.join(official, "denia_official_profile_02.jpg"));
const splash = sharp(path.join(official, "denia_splash_01.jpg"));
const wallpaper = sharp(path.join(official, "denia_wallpaper_desktop_01.jpg"));
const mobile = sharp(path.join(official, "denia_wallpaper_mobile_01.png"));
const celebration = sharp(path.join(official, "denia_wallpaper_mobile_02.png"));
const avatarGen = sharp(path.join(generated, "denia_gen_avatar.png"));
const sleeping = sharp(path.join(generated, "denia_gen_sleeping.png"));

await Promise.all([
  write(avatarGen.clone().extract({ left: 280, top: 0, width: 720, height: 720 }), "character/avatar.webp", 640),
  write(sleeping.clone(), "gallery/classroom-dream.webp", 1280),
  write(profile01.clone(), "gallery/stagecraft.webp", 1080),
  write(profile01.clone().extract({ left: 40, top: 80, width: 1000, height: 1480 }), "character/stagecraft-crop.webp", 780),
  write(profile02.clone().extract({ left: 40, top: 80, width: 1000, height: 980 }), "character/portrait.webp", 720),
  write(splash.clone(), "gallery/curtain-call.webp", 1600),
  write(splash.clone().extract({ left: 0, top: 0, width: 1920, height: 420 }), "hero/banner-top.webp", 1600),
  write(splash.clone().extract({ left: 520, top: 80, width: 980, height: 900 }), "character/curtain-denia.webp", 780),
  write(splash.clone().extract({ left: 0, top: 720, width: 1920, height: 360 }), "hero/banner-bottom.webp", 1600),
  write(wallpaper.clone(), "gallery/name-of-someone.webp", 1600),
  write(wallpaper.clone().extract({ left: 0, top: 0, width: 2560, height: 520 }), "hero/wallpaper-strip.webp", 1600),
  write(mobile.clone(), "gallery/mobile-tide.webp", 720),
  write(celebration.clone(), "hero/celebration.webp", 1080),
]);
