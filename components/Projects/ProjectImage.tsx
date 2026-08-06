"use client"

import { useState } from "react"
import Image from "next/image"
import { getCategoryPlaceholder } from "./placeholders"

export default function ProjectImage({
  src,
  category,
  title,
  alt,
  heightStyle,
  className = "",
  priority = false,
}: {
  src: string
  category: string
  title: string
  alt: string
  heightStyle: string
  className?: string
  priority?: boolean
}) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [triedFallback, setTriedFallback] = useState(false)

  const handleError = () => {
    // Guard against looping if the fallback itself somehow ever failed.
    if (triedFallback) return
    setTriedFallback(true)
    setCurrentSrc(getCategoryPlaceholder(category, title))
  }

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px] bg-white/5 ${className}`}
      style={{ height: heightStyle }}
    >
      <Image
        src={currentSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 90vw, 40vw"
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
    </div>
  )
}
