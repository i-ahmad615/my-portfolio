"use client"

import { useRef, useState } from "react"
import type { CSSProperties, MouseEvent, ReactNode } from "react"

/**
 * Magnetic hover effect: tracks the cursor relative to the element's center
 * and nudges the element toward it. Activates once the cursor comes within
 * `padding` pixels of the element's edge (not just when directly over it),
 * and eases back to rest with a slower, softer transition than the one used
 * while actively tracking.
 */
export default function Magnet({
  children,
  padding = 60,
  strength = 4,
  className,
}: {
  children: ReactNode
  padding?: number
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = event.clientX - centerX
    const distY = event.clientY - centerY
    const distance = Math.hypot(distX, distY)
    const activationRadius = Math.max(rect.width, rect.height) / 2 + padding

    if (distance < activationRadius) {
      setIsActive(true)
      setTranslate({ x: distX / strength, y: distY / strength })
    } else {
      setIsActive(false)
      setTranslate({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setIsActive(false)
    setTranslate({ x: 0, y: 0 })
  }

  const style: CSSProperties = {
    transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`,
    transition: isActive ? "transform 0.3s ease-out" : "transform 0.6s ease-in-out",
    willChange: "transform",
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={style} className={className}>
      {children}
    </div>
  )
}
