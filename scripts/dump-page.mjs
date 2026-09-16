/** Dump what the browser actually received for one URL: status, title, key nodes, console errors. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const selectors = process.argv.slice(3).length ? process.argv.slice(3) : [".navbar", "main", ".hero", ".hero-glass", ".page-head", ".section-title", ".footer"];
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
const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json();
const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const socket = new WebSocket(list.find((entry) => entry.id === target.id).webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.consoleAPICalled" || message.method === "Runtime.exceptionThrown") events.push(JSON.stringify(message.params).slice(0, 400));
  const entry = pending.get(message.id);
  if (entry) { pending.delete(message.id); entry(message.result); }
});
const send = (method, params = {}) => new Promise((resolve) => { const current = ++id; pending.set(current, resolve); socket.send(JSON.stringify({ id: current, method, params })); });
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(2500);
const result = await send("Runtime.evaluate", {
  expression: `(() => {
    const report = { title: document.title, readyState: document.readyState, bodyLength: document.body ? document.body.innerHTML.length : 0, nodes: {} };
    for (const selector of ${JSON.stringify(selectors)}) report.nodes[selector] = document.querySelectorAll(selector).length;
    report.bodyStart = document.body ? document.body.innerHTML.slice(0, 700) : "no body";
    return report;
  })()`,
  returnByValue: true,
});
console.log(`URL: ${url}`);
console.log(JSON.stringify(result.result.value, null, 2));
if (events.length) console.log(`\nconsole/exception events:\n${events.slice(0, 8).join("\n")}`);
chrome.kill();
process.exit(0);
