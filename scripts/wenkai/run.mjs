#!/usr/bin/env node
/**
 * 跨平台调用 scripts/wenkai/subset.py（Windows 上是 python / py，其他系统是 python3）。
 * 需要 fonttools + brotli：  pip install fonttools brotli
 *   node scripts/wenkai/run.mjs build            生成文楷子集（prebuild / predev）
 *   node scripts/wenkai/run.mjs check            源文件覆盖检查
 *   node scripts/wenkai/run.mjs check-html out   构建产物覆盖检查（build 末尾）
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "subset.py");
const args = process.argv.slice(2);
const candidates = process.platform === "win32" ? [["python"], ["py", "-3"], ["python3"]] : [["python3"], ["python"]];
for (const [cmd, ...pre] of candidates) {
  const probe = spawnSync(cmd, [...pre, "-c", "import fontTools, brotli"], { stdio: "ignore" });
  if (probe.error || probe.status !== 0) continue;
  const run = spawnSync(cmd, [...pre, "-X", "utf8", script, ...args], { stdio: "inherit" });
  process.exit(run.status ?? 1);
}
console.error("\n[wenkai] ✖ 找不到带 fonttools + brotli 的 Python。请先运行：pip install fonttools brotli\n");
process.exit(1);
