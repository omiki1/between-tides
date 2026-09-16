"use client";
import { motion } from "framer-motion";
/** Shared entrance motion: 0.55s fade with a 14px rise, disabled by prefers-reduced-motion. */
export function Reveal({children,className,delay=0,as="div",style}:{children:React.ReactNode;className?:string;delay?:number;as?:"div"|"section"|"header"|"article";style?:React.CSSProperties}){
  const Component = motion[as];
  return <Component className={className} style={style} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-60px"}} transition={{duration:.55,ease:[.22,.61,.36,1],delay}}>{children}</Component>;
}
