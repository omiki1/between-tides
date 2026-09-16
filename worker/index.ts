type VisitStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type Env = { VISITS: VisitStore };

const TOTAL_KEY = "total";
const SEEN_PREFIX = "u:";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isVisitPath(pathname: string) {
  return pathname === "/api/visits" || pathname === "/api/visits/";
}

function looksLikeBot(ua: string) {
  return /bot|spider|crawl|slurp|python-requests|httpclient|curl|wget/i.test(ua);
}

async function fingerprint(request: Request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ua = request.headers.get("User-Agent") || "";
  const bytes = new TextEncoder().encode(`${ip}\n${ua}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 20);
}

async function readTotal(env: Env) {
  const raw = await env.VISITS.get(TOTAL_KEY);
  const total = Number(raw || "0");
  return Number.isFinite(total) && total > 0 ? total : 0;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (!isVisitPath(url.pathname)) return new Response("Not found", { status: 404 });
    if (request.method === "GET") return json({ total: await readTotal(env) });
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, POST" } });
    }

    const fetchSite = request.headers.get("Sec-Fetch-Site");
    if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
      return json({ error: "forbidden" }, 403);
    }

    const ua = request.headers.get("User-Agent") || "";
    if (looksLikeBot(ua)) return json({ total: await readTotal(env) });

    const seenKey = `${SEEN_PREFIX}${await fingerprint(request)}`;
    const seen = await env.VISITS.get(seenKey);
    const current = await readTotal(env);
    if (seen) return json({ total: current });

    // 先记下指纹再加总数，避免并发时把同一个人算两次
    await env.VISITS.put(seenKey, "1");
    const total = current + 1;
    await env.VISITS.put(TOTAL_KEY, String(total));
    return json({ total });
  },
};
