"use client";
import dynamic from "next/dynamic";
import { useAfterLoad } from "@/lib/after-load";
/*
 * 文章页的交互小岛：正文、目录、系列卡都是服务端输出的静态 HTML（不参与水合），
 * 这里的几个小岛各自单独成块（next/dynamic + ssr:false），等页面 load 完、主线程空闲
 * （或用户开始交互）后才加载、才挂载，不占首屏水合的那一下。
 */
const CodeCopy=dynamic(()=>import("./CodeCopy").then(m=>m.CodeCopy),{ssr:false});
const TocObserver=dynamic(()=>import("./TocObserver").then(m=>m.TocObserver),{ssr:false});
const SeriesProgress=dynamic(()=>import("./SeriesProgress").then(m=>m.SeriesProgress),{ssr:false});
const OutdatedNotice=dynamic(()=>import("./OutdatedNotice").then(m=>m.OutdatedNotice),{ssr:false});
const ReadDoneCorner=dynamic(()=>import("./ReadDoneCorner").then(m=>m.ReadDoneCorner),{ssr:false});

/** 代码块复制按钮 + 目录高亮 +（系列文章的）已读进度 */
export function PostEnhancers({series}:{series:boolean}){
  const ready=useAfterLoad();
  if(!ready)return null;
  return <><CodeCopy/><TocObserver/>{series&&<SeriesProgress/>}</>;
}

/** 超过一年没更新的提示（年龄只能在浏览器里算） */
export function DeferredOutdated(props:{date:string;updated?:string;seriesHref?:string}){
  const ready=useAfterLoad();
  return ready?<OutdatedNotice {...props}/>:null;
}

/** 文末「读完啦」角落 */
export function DeferredReadDone(){
  const ready=useAfterLoad();
  return ready?<ReadDoneCorner/>:<div className="ft-done-slot" aria-hidden="true"/>;
}

/** 只要目录高亮（项目详情页） */
export function DeferredToc(){
  const ready=useAfterLoad();
  return ready?<TocObserver/>:null;
}
