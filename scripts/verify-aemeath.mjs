import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const chromePath = ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"].find((candidate) => fs.existsSync(candidate));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const port = await new Promise((resolve) => {
  const server = net.createServer();
  server.listen(0, "127.0.0.1", () => { const { port: free } = server.address(); server.close(() => resolve(free)); });
});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-dump-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
for (let attempt = 0; attempt < 60; attempt += 1) {
  try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(250); }
}
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const socket = new WebSocket(list.find((entry) => entry.id === target.id).webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.consoleAPICalled" || message.method === "Runtime.exceptionThrown") {
    events.push(JSON.stringify(message.params).slice(0, 500));
  }
  const entry = pending.get(message.id);
  if (entry) { pending.delete(message.id); entry(message.result); }
});
const send = (method, params = {}) => new Promise((resolve) => { const current = ++id; pending.set(current, resolve); socket.send(JSON.stringify({ id: current, method, params })); });
await send("Runtime.enable");
await send("Page.enable");

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

async function visit(url, width = 1440, height = 900) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 800 });
  await send("Page.navigate", { url });
  await sleep(1800);
}

const failures = [];
await visit("http://127.0.0.1:4173/");
const home = await evaluate(`({
  title: document.title,
  hero: !!document.querySelector('.hero'),
  profile: !!document.querySelector('.profile-card'),
  animePreview: document.querySelectorAll('.anime-preview-grid li').length,
  navAnime: [...document.querySelectorAll('.desktop-nav a')].some(a => a.textContent.includes('追番')),
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  quotes: document.querySelector('.quote-card p')?.textContent || '',
})`);
console.log("HOME", home);
if (!home.hero || !home.profile || home.animePreview < 3 || !home.navAnime) failures.push("home missing aemeath pieces");
if (home.overflow) failures.push("home overflow");

await visit("http://127.0.0.1:4173/anime/");
const anime = await evaluate(`({
  title: document.title,
  cards: document.querySelectorAll('.anime-card').length,
  stats: document.querySelector('.page-stats')?.innerText || '',
  filters: [...document.querySelectorAll('.gallery-filter button')].map(b => b.textContent),
})`);
console.log("ANIME", anime);
if (anime.cards < 12) failures.push("anime grid too small");

const afterClick = await evaluate(`(async () => {
  const movie = [...document.querySelectorAll('.gallery-filter button')].find(b => b.textContent.includes('电影'));
  movie?.click();
  await new Promise(r => setTimeout(r, 400));
  const remaining = document.querySelectorAll('.anime-card').length;
  const first = document.querySelector('.anime-card button');
  first?.click();
  await new Promise(r => setTimeout(r, 300));
  return {
    remaining,
    modal: !!document.querySelector('.anime-modal h2'),
    modalTitle: document.querySelector('.anime-modal h2')?.textContent || '',
  };
})()`);
console.log("ANIME INTERACT", afterClick);
if (!afterClick.modal) failures.push("anime modal did not open");
if (afterClick.remaining !== 12) failures.push(`movie filter expected 12, got ${afterClick.remaining}`);

await visit("http://127.0.0.1:4173/gallery/");
const gallery = await evaluate(`({
  items: document.querySelectorAll('.gallery-item').length,
  roles: [...document.querySelectorAll('.gallery-filter button')].some(b => b.textContent.includes('角色')),
})`);
console.log("GALLERY", gallery);
if (gallery.items < 8 || !gallery.roles) failures.push("gallery missing denia crops");

await visit("http://127.0.0.1:4173/about/");
const about = await evaluate(`({
  bili: [...document.querySelectorAll('a')].some(a => a.href.includes('space.bilibili.com/41883170')),
  anime: [...document.querySelectorAll('a')].some(a => a.getAttribute('href')?.includes('/anime')),
})`);
console.log("ABOUT", about);
if (!about.bili) failures.push("about missing bilibili");

await visit("http://127.0.0.1:4173/", 390, 844);
const mobile = await evaluate(`({
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  menu: !!document.querySelector('.mobile-menu'),
  width: document.documentElement.clientWidth,
})`);
console.log("MOBILE", mobile);
if (mobile.overflow) failures.push("mobile overflow");

if (events.length) console.log("EVENTS", events.slice(0, 6));
console.log(failures.length ? `FAIL ${failures.join(" | ")}` : "PASS browser checks");
chrome.kill();
process.exit(failures.length ? 1 : 0);
