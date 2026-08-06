"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { ElementType, ReactNode } from "react"

export default function FadeIn({
  children,
  as = "div",
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
}: {
  children: ReactNode
  as?: ElementType
  delay?: number
  duration?: number
  x?: number
  y?: number
  className?: string
}) {
  // motion.create() lets this wrapper render as any element type (div, span,
  // li, ...) without losing the motion component identity across renders —
  // memoized so the underlying DOM node isn't torn down and recreated on
  // every re-render when `as` doesn't change.
  const MotionTag = useMemo(() => motion.create(as), [as])

  return (
    <MotionTag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
