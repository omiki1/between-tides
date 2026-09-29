"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Shared entrance: soft fade + rise. Disabled when prefers-reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "article";
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];
  if (reduced) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }
  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}