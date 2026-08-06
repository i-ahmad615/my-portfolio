"use client"

import { Github } from "lucide-react"
import { motion } from "framer-motion"
import Magnet from "./Magnet"

export function LiveProjectButton({ href, label = "Live Project ➾" }: { href: string; label?: string }) {
  const isExternal = href.startsWith("http")

  return (
    <Magnet padding={40} strength={5} className="inline-block">
      <motion.a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-300 hover:bg-[#D7E2EA]/10"
      >
        {label}
      </motion.a>
    </Magnet>
  )
}

/** Small secondary icon-only link, shown only when a project has a distinct GitHub repo. */
export function GithubIconButton({ href }: { href: string }) {
  return (
    <Magnet padding={30} strength={5} className="inline-block">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
        whileTap={{ scale: 0.94 }}
        className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] transition-colors duration-300 hover:bg-[#D7E2EA]/10"
      >
        <Github size={18} />
      </motion.a>
    </Magnet>
  )
}
