/**
 * 纯 CSS 的入场：淡入 + 轻微上浮（.ft-rise，见 styles/perf.css）。
 * 用在首屏就可见的块上，代替 framer-motion 的 Reveal——服务端组件，不参与水合；
 * prefers-reduced-motion 时不动。
 */
export function Rise({children,className,style}:{children:React.ReactNode;className?:string;style?:React.CSSProperties}){
  return <div className={className?`ft-rise ${className}`:"ft-rise"} style={style}>{children}</div>;
}
