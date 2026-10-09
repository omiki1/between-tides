"use client";
import dynamic from "next/dynamic";
import { useAfterLoad } from "@/lib/after-load";

/*
 * 纯装饰的全站效果：不进首屏 JS（next/dynamic + ssr:false 单独成块），
 * 等页面 load 完、主线程空闲（或用户开始交互）后才加载、才开始跑。
 * window.deniaBubble 也在 DeniaBubbles 挂载后才出现——调用方一律写 window.deniaBubble?.()。
 */
const Sakura = dynamic(() => import("./Sakura").then(m => m.Sakura), { ssr: false });
const PointerEffects = dynamic(() => import("./PointerEffects").then(m => m.PointerEffects), { ssr: false });
const DeniaBubbles = dynamic(() => import("./DeniaBubbles").then(m => m.DeniaBubbles), { ssr: false });
const DeniaDetails = dynamic(() => import("./DeniaDetails").then(m => m.DeniaDetails), { ssr: false });
const WelcomeToast = dynamic(() => import("./WelcomeToast").then(m => m.WelcomeToast), { ssr: false });

/** 画布花瓣/夜雨、指针光晕、点击泡泡（放在原来的位置：导航栏之前） */
export function DeferredLayers() {
  const ready = useAfterLoad();
  if (!ready) return null;
  return <><Sakura /><PointerEffects /><DeniaBubbles /></>;
}

/** 首次访问的欢迎条 */
export function DeferredWelcome() {
  const ready = useAfterLoad();
  return ready ? <WelcomeToast /> : null;
}

/** 切走标签页时的标题彩蛋 + 控制台招呼 */
export function DeferredDetails() {
  const ready = useAfterLoad();
  return ready ? <DeniaDetails /> : null;
}
