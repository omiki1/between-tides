/**
 * Headless visual + DOM audit over the Chrome DevTools Protocol.
 *
 *   node scripts/visual-audit.mjs [baseUrl] [--out <dir>]
 *
 * Requires a running server (dev or a static export server) and, if Chrome is not
 * found in the default locations, a --chrome <path> argument.
 * Screenshots are written for human review; the printed checks are what this script asserts.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const baseUrl = (args[0] && !args[0].startsWith("--") ? args[0] : "http://127.0.0.1:3000").replace(/\/$/, "");
const outDir = path.resolve(flag("--out") ?? path.join(process.cwd(), ".research/shots"));
const chromeCandidates = [
  flag("--chrome"),
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chromePath) {
  console.error("No Chrome/Edge binary found. Pass --chrome <path>.");
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const freePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-audit-"));
const port = await freePort();
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--force-device-scale-factor=1",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${port}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"], detached: false });
let chromeStderr = "";
let finished = false;
chrome.stderr.on("data", (chunk) => { chromeStderr += chunk.toString(); });
chrome.on("exit", (code) => {
  if (code !== 0 && code !== null && !finished) console.error(`chrome exited early (code ${code})\n${chromeStderr.slice(-2000)}`);
});
chrome.on("error", (error) => { console.error("failed to start chrome:", error.message); process.exit(2); });

async function devToolsReady() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      const version = await response.json();
      if (version.webSocketDebuggerUrl) return version;
    } catch {
      /* Chrome is still starting */
    }
    await sleep(250);
  }
  throw new Error(`Chrome DevTools endpoint never became ready. stderr: ${chromeStderr.slice(-800)}`);
}

class Client {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message));
      else entry.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = (this.id += 1);
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 45000);
    });
  }
  close() {
    this.socket.close();
  }
}

async function openTarget(url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  return response.json();
}

async function closeTarget(id) {
  try {
    await fetch(`http://127.0.0.1:${port}/json/close/${id}`);
  } catch {
    /* best effort */
  }
}

const results = [];
const record = (page, label, ok, detail) => {
  results.push({ page, label, ok, detail });
  console.log(`${ok ? "ok  " : "FAIL"}  ${page.padEnd(22)} ${label}${detail ? `  — ${detail}` : ""}`);
};

async function makeClient(targetId) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = list.find((entry) => entry.id === targetId);
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", () => reject(new Error("websocket error")), { once: true });
  });
  const client = new Client(socket);
  client.id = 0;
  return client;
}

/* Checks are expressions evaluated in the page; they must stay serialisable. */
const checks = {
  overflow: `(() => {
    const width = document.documentElement.clientWidth;
    const clipped = (node) => {
      const clippers = ["hidden", "clip", "auto", "scroll"];
      for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (clippers.includes(style.overflowX) || clippers.includes(style.overflowY)) return true;
      }
      return false;
    };
    const offenders = [...document.querySelectorAll("body *")]
      .filter((node) => !node.closest(".ambient") && !node.hasAttribute("aria-hidden"))
      .map((node) => ({ node, rect: node.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0 && (rect.right > width + 1.5 || rect.left < -1.5))
      .filter(({ node }) => !clipped(node.parentElement))
      .filter(({ node, rect }) => rect.width < width * 3 && getComputedStyle(node).position !== "fixed")
      .map(({ node, rect }) => \`\${node.tagName.toLowerCase()}.\${(node.className || "").toString().split(" ")[0]} \${Math.round(rect.left)}→\${Math.round(rect.right)}\`);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: width,
      bodyScroll: document.body.scrollWidth,
      offenders: offenders.slice(0, 6),
      offenderCount: offenders.length,
    };
  })()`,
  readingLayout: `(() => {
    const layout = document.querySelector(".reading-layout");
    const prose = document.querySelector(".prose");
    const aside = document.querySelector(".reading-aside");
    const style = getComputedStyle(prose);
    const paragraph = prose.querySelector("p");
    const paragraphStyle = paragraph ? getComputedStyle(paragraph) : null;
    return {
      gridTemplateColumns: layout ? getComputedStyle(layout).gridTemplateColumns : "none",
      proseWidth: Math.round(prose.getBoundingClientRect().width),
      asideVisible: aside ? aside.getBoundingClientRect().height > 0 : false,
      asideTop: aside ? Math.round(aside.getBoundingClientRect().top) : -1,
      fontSize: style.fontSize,
      paragraphLineHeight: paragraphStyle ? paragraphStyle.lineHeight : "n/a",
      figureIsBlock: getComputedStyle(prose.querySelector("figure")).display,
      hasKatex: Boolean(document.querySelector(".katex")),
      hasHighlight: Boolean(document.querySelector("pre code span")),
      tocLinks: document.querySelectorAll(".toc a").length,
      tocTargetsResolve: [...document.querySelectorAll(".toc a")].every((a) => Boolean(document.getElementById(decodeURIComponent(a.hash.slice(1))))),
    };
  })()`,
  journalGrid: `(() => {
    const grid = document.querySelector(".journal-grid");
    const featured = document.querySelector(".featured-post");
    const side = document.querySelector(".post-side");
    return {
      columns: getComputedStyle(grid).gridTemplateColumns,
      featuredLeft: Math.round(featured.getBoundingClientRect().left),
      sideLeft: Math.round(side.getBoundingClientRect().left),
      sameRow: Math.abs(featured.getBoundingClientRect().top - side.getBoundingClientRect().top) < 12,
      smallPostCount: document.querySelectorAll(".small-post").length,
    };
  })()`,
  galleryBoard: `(() => {
    const board = document.querySelector(".gallery-board");
    const items = [...document.querySelectorAll(".gallery-item")];
    const rects = items.map((item) => item.getBoundingClientRect());
    const columns = new Set(items.map((item) => item.offsetLeft)).size;
    return {
      columnCount: getComputedStyle(board).columnCount,
      items: items.length,
      columnsUsed: columns,
      distinctTops: new Set(rects.map((rect) => Math.round(rect.top))).size,
      tallestRatio: Math.max(...items.map((item) => item.getBoundingClientRect().height / item.getBoundingClientRect().width)).toFixed(2),
      imagesWithIntrinsicSize: items.filter((item) => item.querySelector("img")?.getAttribute("width")).length,
      captionsVisible: items.every((item) => Boolean(item.querySelector("figcaption")?.textContent?.trim())),
    };
  })()`,
  heroLayout: `(() => {
    const panel = document.querySelector(".music-panel");
    const now = document.querySelector(".now-panel");
    const grid = getComputedStyle(document.querySelector(".status-grid")).gridTemplateColumns;
    const hero = getComputedStyle(document.querySelector(".hero")).display;
    return {
      heroDisplay: hero,
      statusGrid: grid,
      panelWidth: Math.round(panel.getBoundingClientRect().width),
      nowWidth: Math.round(now.getBoundingClientRect().width),
      panelInsideViewport: panel.getBoundingClientRect().right <= document.documentElement.clientWidth + 1,
      heroHeight: Math.round(document.querySelector(".hero").getBoundingClientRect().height),
      navVisible: getComputedStyle(document.querySelector(".desktop-nav")).display !== "none",
      railVisible: (() => { const rail = document.querySelector(".side-rail"); return rail ? getComputedStyle(rail).display !== "none" : false; })(),
    };
  })()`,
  pageHead: `(() => {
    const head = document.querySelector(".page-head");
    const style = getComputedStyle(head);
    return {
      borderLeft: style.borderLeftWidth + " " + style.borderLeftColor,
      paddingLeft: style.paddingLeft,
      h1Size: getComputedStyle(head.querySelector("h1")).fontSize,
      stats: document.querySelectorAll(".page-stats span").length,
      railLinks: document.querySelectorAll(".side-rail a").length,
      railActive: document.querySelector(".side-rail a[aria-current=page]")?.textContent?.trim() ?? null,
    };
  })()`,
  lightTheme: `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try { window.localStorage.removeItem("theme"); } catch {}
    const before = getComputedStyle(document.body).backgroundColor;
    document.querySelector(".theme-dream")?.click();
    await wait(350);
    const classes = document.documentElement.className;
    const after = getComputedStyle(document.body).backgroundColor;
    const textColor = getComputedStyle(document.body).color;
    document.querySelector(".theme-night")?.click();
    await wait(350);
    return { lightClassApplied: classes.includes("light"), before, after, textColor, restored: getComputedStyle(document.body).backgroundColor };
  })()`,
  lightContrast: `(async () => {
    const parse = (value) => (value.match(/[\\d.]+/g) ?? [0, 0, 0]).slice(0, 3).map(Number);
    const luminance = ([r, g, b]) => {
      const channel = (input) => { const c = input / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
    const theme = document.documentElement.classList.contains("light") ? "light" : "dark";
    const background = parse(getComputedStyle(document.body).backgroundColor);
    const samples = [".prose p", ".reading-lede", ".page-head p", ".page-stats span", ".archive-tags", ".post-date", ".footer-bottom", ".gallery-note"].map((selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const style = getComputedStyle(node);
      const color = parse(style.color);
      const size = parseFloat(style.fontSize);
      return { selector, color: style.color, size, ratio: Number(ratio(color, background).toFixed(2)), large: size >= 18.66 };
    }).filter(Boolean);
    return { theme, samples, min: Math.min(...samples.map((sample) => sample.ratio)) };
  })()`,
  search: `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    await wait(80);
    const dialog = document.querySelector(".search-dialog");
    const opened = dialog.open;
    const focused = document.activeElement?.getAttribute("aria-label");
    for (let attempt = 0; attempt < 40 && !document.querySelector(".search-results li"); attempt += 1) await wait(100);
    const input = dialog.querySelector("input");
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, "地图");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(150);
    const results = [...document.querySelectorAll(".search-results li")].map((li) => li.textContent.trim().slice(0, 40));
    const selected = document.querySelector(".search-results li[aria-selected=true]")?.textContent?.trim().slice(0, 40) ?? null;
    dialog.querySelector("input").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await wait(60);
    const afterArrow = document.querySelector(".search-results li[aria-selected=true]")?.textContent?.trim().slice(0, 40) ?? null;
    dialog.close();
    return { opened, focused, resultCount: results.length, first: results[0] ?? null, selected, afterArrow, closed: !dialog.open };
  })()`,
  lightbox: `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const trigger = document.querySelector(".gallery-open");
    trigger.focus();
    const focusedBefore = document.activeElement === trigger;
    trigger.click();
    await wait(250);
    const dialog = document.querySelector(".lightbox");
    const first = dialog.open ? dialog.querySelector("h3")?.textContent : null;
    const credit = dialog.querySelector(".lightbox-credit")?.textContent?.slice(0, 46) ?? null;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await wait(200);
    const second = dialog.querySelector("h3")?.textContent ?? null;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await wait(200);
    const back = dialog.querySelector("h3")?.textContent ?? null;
    dialog.close();
    await wait(150);
    const active = document.activeElement;
    return {
      opened: first !== null,
      focusedBefore,
      first, second, back,
      navigated: first !== second,
      returned: back === first,
      closed: !dialog.open,
      focusRestored: active === trigger,
      activeElement: active ? (active.className || active.tagName) : "null",
      captionCredit: credit,
    };
  })()`,
  focusRing: `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const candidates = [".back-link", ".toc a", ".button-primary", ".desktop-nav a", ".mobile-menu", ".icon-button", ".text-link", ".gallery-open"];
    const link = candidates.map((selector) => document.querySelector(selector)).find((node) => node && node.getBoundingClientRect().width > 0);
    if (!link) return { outlineWidth: "0px", outlineStyle: "none", outlineColor: "n/a", active: false, target: "none" };
    link.focus();
    await wait(80);
    const style = getComputedStyle(link);
    return { outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle, outlineColor: style.outlineColor, active: document.activeElement === link, target: link.className || link.tagName };
  })()`,
  reducedMotion: `(() => {
    const card = document.querySelector(".project-card") ?? document.querySelector(".gallery-item") ?? document.querySelector(".archive-list a");
    const bubble = document.querySelector(".cursor-bubble");
    const star = document.querySelector(".star");
    return {
      transitionDuration: card ? getComputedStyle(card).transitionDuration : "n/a",
      animationName: star ? getComputedStyle(star).animationName : "n/a",
      cursorBubbleHidden: bubble ? getComputedStyle(bubble).display === "none" : true,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  })()`,
  tabletNav: `(() => ({
    desktopNav: getComputedStyle(document.querySelector(".desktop-nav")).display,
    desktopLinks: document.querySelectorAll(".desktop-nav a").length,
    menuButton: getComputedStyle(document.querySelector(".mobile-menu")).display,
    searchHintHidden: getComputedStyle(document.querySelector(".search-trigger kbd")).display,
    containerWidth: Math.round(document.querySelector("main").getBoundingClientRect().width),
    projectColumns: document.querySelector(".projects-grid") ? getComputedStyle(document.querySelector(".projects-grid")).gridTemplateColumns : "n/a",
  }))()`,
  mobileNav: `(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const dialog = document.querySelector(".mobile-dialog");
    const desktopNav = getComputedStyle(document.querySelector(".desktop-nav")).display;
    document.querySelector(".mobile-menu").click();
    await wait(150);
    const opened = dialog.open;
    const links = dialog.querySelectorAll("nav a").length;
    dialog.close();
    const hero = document.querySelector(".hero");
    const card = document.querySelector(".project-card");
    return {
      desktopNav,
      opened,
      links,
      closed: !dialog.open,
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : null,
      cardWidth: card ? Math.round(card.getBoundingClientRect().width) : null,
      innerViewport: window.innerWidth,
    };
  })()`,
  textScale: `(() => {
    const prose = document.querySelector(".prose");
    const paragraph = prose?.querySelector("p:not(.reading-lede)") ?? prose?.querySelector("p");
    const hero = document.querySelector(".hero h1");
    return {
      proseFontSize: prose ? getComputedStyle(prose).fontSize : "n/a",
      paragraphFontSize: paragraph ? getComputedStyle(paragraph).fontSize : "n/a",
      paragraphLineHeight: paragraph ? getComputedStyle(paragraph).lineHeight : "n/a",
      heroFontSize: hero ? getComputedStyle(hero).fontSize : "n/a",
      bodyWidth: Math.round(document.body.getBoundingClientRect().width),
    };
  })()`,
};

const viewports = [
  { label: "1440", width: 1440, height: 900, mobile: false, touch: false },
  { label: "1280", width: 1280, height: 860, mobile: false, touch: false },
  { label: "1024", width: 1024, height: 820, mobile: false, touch: false },
  { label: "768", width: 768, height: 1024, mobile: true, touch: true },
  { label: "430", width: 430, height: 932, mobile: true, touch: true },
  { label: "390", width: 390, height: 844, mobile: true, touch: true },
  { label: "375", width: 375, height: 812, mobile: true, touch: true },
  { label: "1920", width: 1920, height: 1080, mobile: false, touch: false },
];

const routes = [
  { path: "/", name: "home", checks: ["overflow", "heroLayout"], interactions: [] },
  { path: "/blog/", name: "blog", checks: ["overflow", "journalGrid", "pageHead"], interactions: [] },
  { path: "/blog/rag-as-a-map/", name: "post", checks: ["overflow", "readingLayout", "textScale"], interactions: ["lightTheme", "lightContrast", "focusRing"] },
  { path: "/categories/", name: "categories", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/categories/ai/", name: "category-detail", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/tags/", name: "tags", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/tags/ai/", name: "tag-detail", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/archive/", name: "archive", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/changelog/", name: "changelog", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/projects/", name: "projects", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/projects/mediatlas/", name: "project-detail", checks: ["overflow", "readingLayout", "pageHead"], interactions: [] },
  { path: "/gallery/", name: "gallery", checks: ["overflow", "galleryBoard", "pageHead"], interactions: ["lightbox"] },
  { path: "/notes/", name: "notes", checks: ["overflow", "pageHead"], interactions: [] },
  { path: "/about/", name: "about", checks: ["overflow", "pageHead"], interactions: [] },
];

const mobileOnly = ["mobileNav"];
const tabletOnly = ["tabletNav"];
const globalInteractions = ["search"];

async function evaluate(client, expression, awaited = false) {
  const result = await client.send("Runtime.evaluate", { expression, awaitPromise: awaited, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? "evaluation failed");
  return result.result.value;
}

async function main() {
  const version = await devToolsReady();
  console.log(`Chrome: ${chromePath} (${version.Browser ?? "unknown build"})`);
  console.log(`Base URL: ${baseUrl}\n`);

  for (const route of routes) {
    for (const viewport of viewports) {
      const target = await openTarget(`${baseUrl}${route.path}`);
      const client = await makeClient(target.id);
      try {
        await client.send("Page.enable");
        await client.send("Runtime.enable");
        await client.send("Page.navigate", { url: `${baseUrl}${route.path}` });
        await client.send("Emulation.setDeviceMetricsOverride", {
          width: viewport.width,
          height: viewport.height,
          deviceScaleFactor: 1,
          mobile: viewport.mobile,
        });
        if (viewport.touch) await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
        await sleep(1200);

        for (const name of route.checks) {
          let value;
          try {
            value = await evaluate(client, checks[name]);
          } catch (error) {
            record(`${route.name}@${viewport.label}`, name, false, error.message.split("\n")[0]);
            continue;
          }
          if (name === "overflow") {
            record(`${route.name}@${viewport.label}`, "no horizontal overflow", value.bodyScroll <= value.clientWidth + 1, `scrollWidth=${value.scrollWidth} clientWidth=${value.clientWidth} body=${value.bodyScroll}${value.offenders.length ? ` visible-offenders: ${value.offenders.join(" | ")}` : ""}`);
          } else if (name === "readingLayout") {
            const single = value.gridTemplateColumns.split(" ").length === 1;
            record(`${route.name}@${viewport.label}`, "reading layout", viewport.width <= 1100 ? single : !single, `columns=${value.gridTemplateColumns} prose=${value.proseWidth}px font=${value.fontSize} line=${value.paragraphLineHeight} katex=${value.hasKatex} hljs=${value.hasHighlight} toc=${value.tocLinks} anchors=${value.tocTargetsResolve} aside=${value.asideVisible}`);
          } else if (name === "textScale") {
            const expected = viewport.width <= 700 ? 16 : 17;
            record(`${route.name}@${viewport.label}`, "article text scale", Number.parseFloat(value.paragraphFontSize) === expected, `paragraph=${value.paragraphFontSize}/${value.paragraphLineHeight} prose=${value.proseFontSize} hero=${value.heroFontSize}`);
          } else if (name === "journalGrid") {
            const stacked = viewport.width <= 700;
            record(`${route.name}@${viewport.label}`, "journal layout", stacked ? value.sideLeft === value.featuredLeft || value.smallPostCount >= 2 : value.sameRow, `columns=${value.columns} featuredLeft=${value.featuredLeft} sideLeft=${value.sideLeft} sameRow=${value.sameRow} small=${value.smallPostCount}`);
          } else if (name === "galleryBoard") {
            const expectedColumns = viewport.width <= 700 ? 1 : viewport.width <= 900 ? 2 : viewport.width <= 1100 ? 3 : 4;
            const expectedItems = 6;
            record(`${route.name}@${viewport.label}`, "gallery grid", value.columnsUsed >= 1 && value.columnsUsed <= expectedColumns && value.items === expectedItems, `columnCount=${value.columnCount} items=${value.items} columnsUsed=${value.columnsUsed} tops=${value.distinctTops} widestCard=${value.tallestRatio} intrinsic=${value.imagesWithIntrinsicSize} captions=${value.captionsVisible}`);
          } else if (name === "heroLayout") {
            record(`${route.name}@${viewport.label}`, "home composition", value.panelInsideViewport, `${value.heroDisplay} grid=${value.statusGrid} panel=${value.panelWidth} now=${value.nowWidth} hero=${value.heroHeight} nav=${value.navVisible} rail=${value.railVisible}`);
          } else if (name === "pageHead") {
            record(`${route.name}@${viewport.label}`, "page header", value.railLinks === 10, `border=${value.borderLeft} padding=${value.paddingLeft} h1=${value.h1Size} stats=${value.stats} railLinks=${value.railLinks} active=${value.railActive}`);
          }
        }

        if (viewport.label === "1440" || viewport.label === "390" || viewport.label === "768") {
          for (const name of [...route.interactions, ...(viewport.label === "390" || viewport.label === "375" ? mobileOnly : []), ...(viewport.label === "768" ? tabletOnly : [])]) {
            let value;
            try {
              value = await evaluate(client, checks[name], true);
            } catch (error) {
              record(`${route.name}@${viewport.label}`, name, false, error.message.split("\n")[0]);
              continue;
            }
            if (name === "lightTheme") {
              record(`${route.name}@${viewport.label}`, "theme toggle", value.lightClassApplied && value.before !== value.after && value.before === value.restored, `before=${value.before} light=${value.after} restored=${value.restored} text=${value.textColor}`);
            } else if (name === "lightContrast") {
              const failures = value.samples.filter((sample) => sample.ratio < (sample.large ? 3 : 4.5));
              record(`${route.name}@${viewport.label}`, `contrast (${value.theme})`, failures.length === 0, `min=${value.min} ${failures.length ? failures.map((f) => `${f.selector}=${f.ratio}`).join(" ") : "all samples ≥ target"}`);
            } else if (name === "focusRing") {
              record(`${route.name}@${viewport.label}`, "focus ring", value.outlineStyle !== "none" && Number.parseFloat(value.outlineWidth) >= 2, `${value.outlineWidth} ${value.outlineStyle} ${value.outlineColor}`);
            } else if (name === "lightbox") {
              record(`${route.name}@${viewport.label}`, "lightbox", value.opened && value.navigated && value.returned && value.closed && value.focusRestored, `open=${value.opened} first="${value.first}" next="${value.second}" back="${value.back}" closed=${value.closed} focus=${value.focusRestored} (before=${value.focusedBefore}, after=${value.activeElement}) credit="${value.captionCredit}"`);
            } else if (name === "tabletNav") {
              record(`${route.name}@${viewport.label}`, "tablet navigation", value.menuButton !== "none" && value.desktopLinks === 10, `desktopNav=${value.desktopNav} links=${value.desktopLinks} menuButton=${value.menuButton} searchHint=${value.searchHintHidden} main=${value.containerWidth} projects=${value.projectColumns}`);
            } else if (name === "mobileNav") {
              record(`${route.name}@${viewport.label}`, "mobile navigation", value.opened && value.desktopNav === "none" && value.links === 10 && value.closed, `desktopNav=${value.desktopNav} opened=${value.opened} links=${value.links} hero=${value.heroHeight} card=${value.cardWidth} viewport=${value.innerViewport}`);
            }
          }
          const shot = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
          const file = path.join(outDir, `${route.name}-${viewport.label}.png`);
          fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
        }
      } catch (error) {
        record(`${route.name}@${viewport.label}`, "run", false, error.message);
      } finally {
        client.close();
        await closeTarget(target.id);
      }
    }
  }

  /* Global interactions and reduced-motion emulation on the post page. */
  for (const name of globalInteractions) {
    const target = await openTarget(`${baseUrl}/blog/`);
    const client = await makeClient(target.id);
    try {
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await sleep(1200);
      const value = await evaluate(client, checks[name], true);
      record("global@1440", "search dialog", value.opened && value.resultCount > 0 && value.closed, `opened=${value.opened} focus=${value.focused} results=${value.resultCount} first="${value.first}" selected="${value.selected}" afterArrow="${value.afterArrow}" closed=${value.closed}`);
    } catch (error) {
      record("global@1440", "search dialog", false, error.message);
    } finally {
      client.close();
      await closeTarget(target.id);
    }
  }

  /* Reduced-motion behaviour on a page with cards and ambient stars. */
  const target = await openTarget(`${baseUrl}/projects/`);
  const client = await makeClient(target.id);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sleep(1200);
    const value = await evaluate(client, checks.reducedMotion);
    record("global@1440", "reduced motion", value.animationName === "none" && value.scrollBehavior === "auto", `transition=${value.transitionDuration} animation=${value.animationName} cursorBubbleHidden=${value.cursorBubbleHidden} scroll=${value.scrollBehavior}`);
  } catch (error) {
    record("global@1440", "reduced motion", false, error.message);
  } finally {
    client.close();
    await closeTarget(target.id);
  }

  const failures = results.filter((result) => !result.ok);
  console.log(`\n${results.length - failures.length}/${results.length} checks passed. Screenshots in ${outDir}`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const failure of failures) console.log(`  ${failure.page} · ${failure.label} — ${failure.detail}`);
  }
  finished = true;
  chrome.kill();
  process.exit(failures.length ? 1 : 0);
}

await main();
