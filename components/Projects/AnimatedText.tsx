"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"

function Char({
  children,
  start,
  end,
  progress,
}: {
  children: string
  start: number
  end: number
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, [start, end], [0.2, 1])
  const display = children === " " ? " " : children

  return (
    <span className="relative inline-block">
      {/* Invisible placeholder reserves layout space so the line doesn't reflow as characters animate in. */}
      <span className="invisible">{display}</span>
      <motion.span style={{ opacity }} className="absolute left-0 top-0">
        {display}
      </motion.span>
    </span>
  )
}

/**
 * Character-by-character scroll-reveal: each character's opacity ramps from
 * 0.2 to 1 based on its position in the string relative to how far the host
 * paragraph has scrolled through the viewport (tracked via useScroll on the
 * <p> itself, offset ["start 0.8", "end 0.2"]).
 */
export default function AnimatedText({
  children,
  className = "",
}: {
  children: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  })

  const words = children.split(" ")
  const characters: string[] = []
  words.forEach((word, wordIndex) => {
    word.split("").forEach((char) => characters.push(char))
    if (wordIndex !== words.length - 1) characters.push(" ")
  })
  const total = characters.length

  return (
    <p ref={ref} className={className}>
      {characters.map((char, index) => (
        <Char key={index} start={index / total} end={(index + 1) / total} progress={scrollYProgress}>
          {char}
        </Char>
      ))}
    </p>
  )
}
