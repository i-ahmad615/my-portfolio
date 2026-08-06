"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Section heading, animated identically to every other heading on the site
 * (ABOUT ME / SKILLS / SERVICES / TESTIMONIALS): fade + rise on scroll into view.
 */
export default function SectionHeading({
  children,
  className = "",
  gradient = false,
}: {
  children: ReactNode
  className?: string
  gradient?: boolean
}) {
  return (
    <motion.h2
      className={`text-5xl md:text-7xl font-black tracking-tighter text-center ${
        gradient ? "shiny-text" : ""
      } ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.h2>
  )
}
