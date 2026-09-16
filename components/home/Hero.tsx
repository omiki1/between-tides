"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight,ArrowDown,Code2,Music2,Sparkles,Play } from "lucide-react";
import { motion,useMotionValue,useSpring,useReducedMotion } from "framer-motion";
import { useState,useRef,useEffect } from "react";
import { site } from "@/config/site";
import voices from "@/data/denia-voices.json";
import styles from "./Hero.module.css";
export function Hero(){
 const reduced=useReducedMotion();
 const mx=useMotionValue(0),my=useMotionValue(0);
 const x=useSpring(mx,{stiffness:45,damping:25}),y=useSpring(my,{stiffness:45,damping:25});
 const [clicks,setClicks]=useState(0);const [resonance,setResonance]=useState(false);
 const [quote,setQuote]=useState(voices[0].text);
 const [voicePlaying,setVoicePlaying]=useState(false);
 const [voiceError,setVoiceError]=useState("");
 const voice=useRef<HTMLAudioElement>(null);
 const voiceRequest=useRef(0);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
  const element=voice.current;const requestSequence=voiceRequest;
  const stop=(event:Event)=>{if((event as CustomEvent).detail!=="voice"){voiceRequest.current++;element?.pause()}};
  window.addEventListener("site-audio",stop);
  return()=>{if(timer.current)clearTimeout(timer.current);requestSequence.current++;element?.pause();window.removeEventListener("site-audio",stop)};
 },[]);
 async function resonate(){
  const element=voice.current;if(!element)return;
  if(!element.paused){voiceRequest.current++;element.pause();return}
  const ticket=++voiceRequest.current;
  const clip=voices[clicks%voices.length];
  const next=clicks+1;setClicks(next);
  setQuote(clip.text);setVoiceError("");
  window.dispatchEvent(new CustomEvent("site-audio",{detail:"voice"}));
  element.src=clip.src;element.volume=.75;
  if(next%5===0){setResonance(true);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setResonance(false),4000)}
  try{await element.play()}catch{if(ticket===voiceRequest.current)setVoiceError("语音暂时无法播放，请重试。")}
 }
 return <section className={`hero ${styles.scene} ${resonance?styles.resonating:""}`} aria-label="梦境与潮汐" onPointerMove={event=>{if(reduced||event.pointerType!=="mouse")return;const box=event.currentTarget.getBoundingClientRect();mx.set(((event.clientX-box.left)/box.width-.5)*16);my.set(((event.clientY-box.top)/box.height-.5)*12)}} onPointerLeave={()=>{mx.set(0);my.set(0)}}>
  <div className={styles.truncTop} aria-hidden="true"><Image src="/assets/denia/hero/banner-top.webp" alt="" fill sizes="100vw"/></div>
  <div className={styles.landscape} aria-hidden="true"><Image src="/artwork/dream-tide.webp" alt="" fill sizes="100vw" preload/></div>
  <div className={styles.meteors} aria-hidden="true"><i/><i/><i/></div>
  <div className="hero-copy">
   <div className="hero-intro"><span className="small-orbit"/>BETWEEN DREAMS &amp; TIDES</div>
   <p className="greeting">{site.hero.greeting} <span>{site.nickname}</span><span className="greeting-line"/></p>
   <h1>{site.hero.headline}<br/><span>{site.hero.emphasis}</span></h1>
   <p className="hero-english">{site.hero.english}</p>
   <p className="hero-description">{site.description}<br/>这里是我的数字花园，也是偶尔停靠的岸。</p>
   <div className="hero-actions">
    <Link className="button-primary" href="/projects/">探索我的项目<ArrowUpRight size={17}/></Link>
    {site.github ? <a className="button-quiet" href={site.github} target="_blank" rel="me noreferrer">GitHub<ArrowUpRight size={16}/></a> : null}
    <Link className="button-quiet" href="/anime/">我的追番<ArrowUpRight size={16}/></Link>
   </div>
   <div className="hero-interests"><span><Code2 size={14}/> Code</span><span><Sparkles size={14}/> AI &amp; ideas</span><span><Music2 size={14}/> Music</span></div>
  </div>
  <div className={styles.art}>
   <span className={styles.word} aria-hidden="true">DENIA</span>
   <div className={styles.portal} aria-hidden="true"/><div className={styles.orbit} aria-hidden="true"/>
   <span className={styles.coordinate}>WUTHERING WAVES / DREAM ARCHIVE</span>
   <div className={styles.water} aria-hidden="true"><i/><i/><i/></div>
   <motion.div className={styles.character} style={reduced?{}:{x,y}}>
    <Image src="/artwork/denia.webp" alt="Denia 粉发立绘，漂浮于星光与梦境潮汐之间" fill sizes="(max-width: 700px) 270px, 390px" preload/>
   </motion.div>
   <div className={styles.nameplate}><span className="small-orbit"/><div><b>达妮娅</b><small>DENIA · WUTHERING WAVES</small></div><Sparkles size={18}/></div>
   <div className={styles.quote}><span>“</span><p aria-live="polite">{voiceError||quote}</p><small>中文角色语音</small></div>
   <button className={`${styles.bubble} ${styles.touchBubble}`} aria-label={voicePlaying?"停止角色语音":"播放达妮娅中文语音"} aria-pressed={voicePlaying} onClick={()=>void resonate()}><span>{voicePlaying?"停止语音":"点击听语音"}</span></button>
   <audio ref={voice} preload="none" onPlay={()=>setVoicePlaying(true)} onPause={()=>setVoicePlaying(false)} onEnded={()=>setVoicePlaying(false)}/>
   <i className={`${styles.bubble} ${styles.bubbleTwo}`} aria-hidden="true"/><i className={`${styles.bubble} ${styles.bubbleThree}`} aria-hidden="true"/>
   <span className={styles.sparkle} aria-hidden="true"/><span className={styles.sparkleSmall} aria-hidden="true"/>
   <div className={styles.truncBottom} aria-hidden="true"><Image src="/assets/denia/hero/banner-bottom.webp" alt="" fill sizes="(max-width:700px) 100vw, 50vw"/></div>
  </div>
  <div className="hero-bottom">
   <a href="#journal"><ArrowDown size={14}/>向下探索</a>
   <span>{clicks>0?quote:""}</span>
   <Link className="eyebrow" href="/blog/"><Play size={11}/>READ THE JOURNAL</Link>
  </div>
 </section>;
}
