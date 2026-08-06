"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

// Place your avatar video at: public/avatar/assistant-idle.webm
// (an .mp4 at the same path is used as a fallback for browsers without WebM support, e.g. Safari)
const AVATAR_SRC_WEBM = "/avatar/assistant-idle.webm"
const AVATAR_SRC_MP4 = "/avatar/assistant-idle.mp4"

export default function AvatarWidget({ onOpen }: { onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    // Mount (and start fetching) the video only after the initial page has
    // settled, so it never competes with first paint or the hero's GSAP/WebGL work.
    const timer = setTimeout(() => setShouldLoadVideo(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!shouldLoadVideo) return
    const video = videoRef.current
    if (!video) return

    video.play().catch(() => {})

    // Pause while the tab is backgrounded to save resources; resume on return
    // (unless the user is currently hovering, in which case it stays paused).
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      } else if (!video.matches(":hover")) {
        video.play().catch(() => {})
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [shouldLoadVideo])

  const handleMouseEnter = () => videoRef.current?.pause()
  const handleMouseLeave = () => {
    if (!document.hidden) videoRef.current?.play().catch(() => {})
  }

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Open chat with Ahmad's AI assistant"
      className="fixed bottom-6 right-6 z-[60] w-24 h-24 sm:w-32 sm:h-32"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Soft pulsing glow, matching the site's blob/floating-dot motif */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-40 blur-2xl -z-10"
        animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.15, 0.35] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <span className="relative block w-full h-full drop-shadow-[0_8px_30px_rgba(124,58,237,0.35)]">
        {shouldLoadVideo ? (
          <video
            ref={videoRef}
            muted
            playsInline
            loop
            preload="none"
            className="w-full h-full object-contain"
          >
            <source src={AVATAR_SRC_WEBM} type="video/webm" />
            <source src={AVATAR_SRC_MP4} type="video/mp4" />
          </video>
        ) : (
          <span className="flex w-full h-full items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse" />
          </span>
        )}
      </span>
    </motion.button>
  )
}
