/** Report the widest elements on a narrow viewport so overflow causes are visible. */
const url = process.argv[2] ?? "http://127.0.0.1:4180/changelog/";
const { spawn } = await import("node:child_process");
const fs = await import("node:fs");
const net = await import("node:net");
const os = await import("node:os");
const path = await import("node:path");

const chromePath = ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"].find((candidate) => fs.existsSync(candidate));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const port = await new Promise((resolve) => {
  const server = net.createServer();
  server.listen(0, "127.0.0.1", () => { const { port: free } = server.address(); server.close(() => resolve(free)); });
});
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dsh-wide-"));
spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" });
for (let attempt = 0; attempt < 60; attempt += 1) {
  try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(250); }
}
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json();
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const socket = new WebSocket(list.find((entry) => entry.id === target.id).webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const entry = pending.get(message.id);
  if (entry) { pending.delete(message.id); entry(message.result); }
});
const send = (method, params = {}) => new Promise((resolve) => { const current = ++id; pending.set(current, resolve); socket.send(JSON.stringify({ id: current, method, params })); });
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url });
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await sleep(1500);
const result = await send("Runtime.evaluate", {
  expression: `(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .map((node) => ({ node, rect: node.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > width - 4 || rect.right > width + 1)
      .map(({ node, rect }) => ({
        tag: node.tagName.toLowerCase(),
        cls: (node.className || "").toString().replace(/\\s+/g, ".").slice(0, 60),
        w: Math.round(rect.width),
        right: Math.round(rect.right),
      }))
      .slice(0, 25);
  })()`,
  returnByValue: true,
});
console.log(`viewport ${390}, offenders:`);
for (const item of result.result.value) console.log(`  ${item.tag}.${item.cls}  width=${item.w}  right=${item.right}`);
process.exit(0);
