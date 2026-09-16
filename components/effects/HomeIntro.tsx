"use client";
/* eslint-disable @next/next/no-img-element -- small pre-optimized intro layers must expose native decode/load events. */
import { useEffect, useRef } from "react";
import styles from "./HomeIntro.module.css";

const SESSION_KEY = "between-tides.home-intro-seen.v2";
const PLAY_MS = 4400;
const EXIT_MS = 800;
const ASSET_WAIT_MS = 1600;

function waitForImage(image: HTMLImageElement, signal: AbortSignal) {
  return new Promise<void>(resolve => {
    const done = () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      signal.removeEventListener("abort", done);
      resolve();
    };
    if (image.complete || signal.aborted) { done(); return; }
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
    signal.addEventListener("abort", done, { once: true });
  });
}

export function HomeIntro() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const skipButton = node.querySelector<HTMLButtonElement>("button");
    const timeouts = new Set<number>();
    let generation = 0, disposed = false, assets: AbortController | null = null;
    let previousFocus: HTMLElement | null = null;
    let inertElements: { element: HTMLElement; previous: boolean }[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => { timeouts.delete(id); fn(); }, ms);
      timeouts.add(id);
      return id;
    };
    const clear = () => { generation++; timeouts.forEach(clearTimeout); timeouts.clear(); assets?.abort(); };
    const unlock = () => {
      const wasFocused = node.contains(document.activeElement);
      inertElements.forEach(({ element, previous }) => { element.inert = previous; });
      inertElements = [];
      if (wasFocused) {
        const target = previousFocus && previousFocus !== document.body && previousFocus.isConnected ? previousFocus : document.getElementById("main");
        const oldTabindex = target?.getAttribute("tabindex");
        if (target && oldTabindex === null) target.setAttribute("tabindex", "-1");
        target?.focus({ preventScroll: true });
        if (target && oldTabindex === null) target.removeAttribute("tabindex");
      }
      previousFocus = null;
    };
    const finish = () => {
      clear();
      unlock();
      node.dataset.phase = "done";
      document.documentElement.dataset.intro = "seen";
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Session storage may be unavailable. */ }
    };
    const lock = () => {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Keep only the intro and its ancestors active, including when inside <main>.
      let branch: HTMLElement | null = node;
      while (branch && branch !== document.body) {
        const parent: HTMLElement | null = branch.parentElement;
        if (!parent) break;
        for (const sibling of parent.children) {
          if (sibling !== branch && sibling instanceof HTMLElement && !["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)) {
            inertElements.push({ element: sibling, previous: sibling.inert });
            sibling.inert = true;
          }
        }
        branch = parent;
      }
      skipButton?.focus({ preventScroll: true });
    };
    const play = async () => {
      clear(); unlock();
      if (reduced.matches) { finish(); return; }
      const ticket = generation;
      document.documentElement.dataset.intro = "boot";
      node.dataset.phase = "preparing";
      node.dataset.character = "illustration";
      lock();
      assets = new AbortController();
      const controller = assets;
      later(() => controller.abort(), ASSET_WAIT_MS);
      await Promise.all(Array.from(node.querySelectorAll("img")).map(image => waitForImage(image, controller.signal)));
      if (disposed || ticket !== generation) return;
      // A frame boundary lets replay reset every CSS animation, even with warm assets.
      later(() => {
        if (disposed || ticket !== generation) return;
        node.dataset.phase = "playing";
        later(() => {
          if (ticket !== generation) return;
          node.dataset.phase = "leaving";
          document.documentElement.dataset.intro = "leaving";
          later(finish, EXIT_MS);
        }, PLAY_MS);
      }, 32);
    };
    const onKey = (event: KeyboardEvent) => {
      if (!["boot", "leaving"].includes(document.documentElement.dataset.intro || "")) return;
      if (event.key === "Escape") { event.preventDefault(); finish(); }
      if (event.key === "Tab") { event.preventDefault(); skipButton?.focus(); }
    };
    const onReplay = () => { void play(); };
    const onPreference = () => { if (reduced.matches) finish(); };
    const onExitAnimation = (event: AnimationEvent) => {
      if (event.target instanceof HTMLElement && event.target.classList.contains(styles.characterFlip)) node.dataset.character = "chibi";
      if (event.target === node && node.dataset.phase === "leaving") finish();
    };
    const replay = new URLSearchParams(location.search).get("intro") === "1";
    let seen = false;
    try { seen ||= sessionStorage.getItem(SESSION_KEY) === "1"; } catch { /* Fall back to this page's state. */ }
    if (reduced.matches || (seen && !replay)) {
      node.dataset.phase = "done";
      document.documentElement.dataset.intro = "seen";
    } else { void play(); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("between-tides-replay-intro", onReplay);
    reduced.addEventListener("change", onPreference);
    skipButton?.addEventListener("click", finish);
    node.addEventListener("animationend", onExitAnimation);
    return () => {
      disposed = true; clear(); unlock();
      document.documentElement.dataset.intro = "seen";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("between-tides-replay-intro", onReplay);
      reduced.removeEventListener("change", onPreference);
      skipButton?.removeEventListener("click", finish);
      node.removeEventListener("animationend", onExitAnimation);
    };
  }, []);

  return <section ref={root} className={`home-intro ${styles.root}`} data-phase="boot" role="dialog" aria-modal="true" aria-label="开场动画">
    <div className={styles.backdrop} aria-hidden="true"><img src="/artwork/intro/water-sky.webp" alt="" width="1536" height="1024" decoding="async" fetchPriority="high"/></div>
    <div className={styles.shade} aria-hidden="true"/>
    <div className={styles.frame} aria-hidden="true"><i/><i/><i/><i/></div>
    <div className={styles.bubbles} aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties}/>)}</div>
    <span className={`${styles.word} ${styles.wordLeft}`} aria-hidden="true"><b>伪物</b><b>弥留</b></span>
    <span className={`${styles.word} ${styles.wordRight}`} aria-hidden="true"><b>蚀刻</b><b>繁彩</b></span>
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.aura}/>
      <div className={styles.glass}><i/></div>
      <div className={styles.characterEnter}><div className={styles.characterFloat}>
        <div className={styles.characterFlip}>
          <div className={styles.front}><img className={styles.character} src="/artwork/denia.webp" alt="" width="835" height="1400" decoding="async" fetchPriority="high"/></div>
          <div className={styles.back}><img className={styles.character} src="/artwork/intro/denia-chibi.webp" alt="" width="720" height="720" decoding="async" fetchPriority="high"/></div>
        </div>
      </div></div>
      <div className={styles.turnGlint}/>
      <div className={styles.water}><i/><i/><i/></div>
      <span className={styles.sparkle}/><span className={styles.sparkleSmall}/>
    </div>
    <div className={styles.loading} role="status"><span>正在打开页面</span><i/><i/><i/></div>
    <p className={styles.mark}>DENIA · WUTHERING WAVES</p>
    <button className={styles.skip} type="button" aria-label="跳过开场动画">跳过 <span aria-hidden="true">↗</span></button>
  </section>;
}
