#!/usr/bin/env node
/**
 * Cloudflare 部署引导脚本（主站）。
 *
 * 为什么需要它
 * ------------
 * `wrangler deploy` 需要 CLOUDFLARE_API_TOKEN 与 CLOUDFLARE_ACCOUNT_ID。
 * 这个 Token 是机密，**不能**写进 .env（那个文件会进版本库 —— 本仓库有意提交
 * .env.production，因此绝不能在 .env* 里放任何秘密）。
 *
 * 本脚本把「从哪里读凭据」这件事固定下来，做成一条命令：
 *
 *   npm run deploy:cf
 *
 * 凭据查找顺序（找到即用）：
 *   1. 已存在的环境变量（CI 里用这个 —— Cloudflare Workers Builds 会自己注入）
 *   2. 本机密钥文件，默认路径见下，可用 CLOUDFLARE_SECRETS_FILE 覆盖
 *
 * 本脚本只读取，不打印任何凭据值。
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ACCOUNT_ID = "ca1645341e22bf174f5658d2d375e331";

const DEFAULT_SECRETS_FILE = join(
  homedir(),
  ".dsh-secrets",
  "cloudflare.env",
);

/**
 * 用项目内的 wrangler，而不是 `npx wrangler`：
 * npx 在 Windows 上要经 shell，且可能临时下载不同版本。
 * 直接跑 node + 本地 bin，跨平台一致且锁定版本。
 */
function resolveWranglerBin() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const candidates = [
    join(repoRoot, "node_modules", "wrangler", "bin", "wrangler.js"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function readSecretsFile(path) {
  if (!existsSync(path)) return null;
  const out = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return out;
}

function resolveCredentials() {
  // 1) 环境变量优先（CI 场景）
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return {
      token: process.env.CLOUDFLARE_API_TOKEN,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || ACCOUNT_ID,
      source: "environment",
    };
  }

  // 2) 本机密钥文件
  const path = process.env.CLOUDFLARE_SECRETS_FILE || DEFAULT_SECRETS_FILE;
  const secrets = readSecretsFile(path);
  if (secrets?.CLOUDFLARE_API_TOKEN) {
    return {
      token: secrets.CLOUDFLARE_API_TOKEN,
      accountId: secrets.CLOUDFLARE_ACCOUNT_ID || ACCOUNT_ID,
      source: "secrets file",
    };
  }

  return null;
}

const creds = resolveCredentials();

if (!creds) {
  console.error(
    [
      "[deploy] 找不到 Cloudflare 凭据。",
      "",
      "请任选一种：",
      "  A. 设置环境变量 CLOUDFLARE_API_TOKEN（以及可选的 CLOUDFLARE_ACCOUNT_ID）",
      `  B. 在 ${process.env.CLOUDFLARE_SECRETS_FILE || DEFAULT_SECRETS_FILE}`,
      "     里写一行：CLOUDFLARE_API_TOKEN=<你的 token>",
      "",
      "Token 需要的最小权限见仓库 README 的部署章节。",
      "注意：不要把 Token 写进 .env 或任何会进版本库的文件。",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `[deploy] 使用凭据来源: ${creds.source}  账号: ${creds.accountId.slice(0, 8)}…`,
);

const wranglerBin = resolveWranglerBin();

if (!wranglerBin) {
  console.error(
    "[deploy] 找不到本地 wrangler。请先运行：npm install",
  );
  process.exit(1);
}

try {
  execFileSync(process.execPath, [wranglerBin, "deploy", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: {
      ...process.env,
      CLOUDFLARE_API_TOKEN: creds.token,
      CLOUDFLARE_ACCOUNT_ID: creds.accountId,
    },
  });
} catch (error) {
  console.error(
    `[deploy] wrangler 失败：${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
