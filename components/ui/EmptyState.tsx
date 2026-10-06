/* eslint-disable @next/next/no-img-element -- 固定尺寸的小头像，已手写 1x/2x */
import type { ReactNode } from "react";

/**
 * 统一的空状态：达妮娅的圆形小头像（官方角色资料图）+ 一句话。
 * 归档 / 标签 / 分类列表没有内容、动画页筛不到、Cmd+K 搜不到时都用它。
 * 纯展示组件，服务端组件和客户端组件里都能用；children 放按钮或推荐链接。
 */
export function EmptyState({ line, hint, children, className }: { line: ReactNode; hint?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={`ft-empty${className ? ` ${className}` : ""}`} role="status">
      <span className="ft-empty-avatar" aria-hidden="true">
        <img src="/artwork/denia/face-circle-160.webp" srcSet="/artwork/denia/face-circle-160.webp 1x, /artwork/denia/face-circle-320.webp 2x" alt="" width={72} height={72} loading="lazy" decoding="async" />
        <i className="ft-bubble b1" /><i className="ft-bubble b2" />
      </span>
      <div className="ft-empty-text">
        <p className="ft-empty-line">{line}</p>
        {hint && <p className="ft-empty-hint">{hint}</p>}
        {children}
        <small className="ft-art-credit">OFFICIAL ART · KURO GAMES <b>· 鸣潮角色资料图</b></small>
      </div>
    </div>
  );
}
