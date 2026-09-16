"use client";

const SESSION_KEY = "between-tides.visit-sent.v1";
const LOCAL_KEY = "between-tides.visits-local.v1";

let total: number | null = null;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function emit(next: number | null) {
  total = next;
  listeners.forEach((listener) => listener());
}

function shouldMockVisits() {
  const { hostname, port } = window.location;
  const local = hostname === "127.0.0.1" || hostname === "localhost";
  return local && (port === "3000" || port === "3001");
}

function sessionCounted() {
  try { return window.sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

function markSessionCounted() {
  try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* 隐私模式 */ }
}

function readLocalTotal() {
  try {
    const value = Number(window.localStorage.getItem(LOCAL_KEY) || "0");
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeLocalTotal(value: number) {
  try { window.localStorage.setItem(LOCAL_KEY, String(value)); } catch { /* 隐私模式 */ }
}

async function recordFromApi() {
  const counted = sessionCounted();
  const response = await fetch("/api/visits", {
    method: counted ? "GET" : "POST",
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("visits");
  const payload = (await response.json()) as { total?: number };
  const value = Number(payload.total);
  if (!Number.isFinite(value) || value < 0) throw new Error("visits");
  if (!counted) markSessionCounted();
  emit(value);
}

function recordLocally() {
  const counted = sessionCounted();
  let value = readLocalTotal();
  if (!counted) {
    value += 1;
    writeLocalTotal(value);
    markSessionCounted();
  }
  emit(value || null);
}

async function recordVisit() {
  if (shouldMockVisits()) {
    recordLocally();
    return;
  }
  try {
    await recordFromApi();
  } catch {
    emit(null);
  }
}

export function subscribeVisits(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => { listeners.delete(onStoreChange); };
}

export function getVisitTotal() {
  return total;
}

export function getVisitTotalServer() {
  return null;
}

export function ensureVisitRecorded() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!inflight) inflight = recordVisit();
  return inflight;
}
