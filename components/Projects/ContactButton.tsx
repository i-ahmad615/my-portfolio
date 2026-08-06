"use client"

import { motion } from "framer-motion"
import Magnet from "./Magnet"

/**
 * Reusable gradient pill CTA, available for reuse anywhere a "Contact Me"
 * style call-to-action is needed (not currently wired into the Projects
 * section itself, which only uses LiveProjectButton).
 */
export default function ContactButton({
  href = "/contact",
  label = "Contact Me",
}: {
  href?: string
  label?: string
}) {
  return (
    <Magnet padding={40} strength={5} className="inline-block">
      <motion.a
        href={href}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center justify-center rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-white outline outline-2 outline-white outline-offset-[-3px]"
        style={{
          background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
          boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset",
        }}
      >
        {label}
      </motion.a>
    </Magnet>
  )
}
