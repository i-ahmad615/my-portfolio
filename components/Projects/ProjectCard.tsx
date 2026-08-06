"use client"

import { useMemo } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import type { Project } from "../../types/content"
import ProjectImageGrid from "./ProjectImageGrid"
import { GithubIconButton, LiveProjectButton } from "./LiveProjectButton"
import { INITIAL_BUFFER, getTotalUnits } from "./stackTimeline"

// How many cards behind the currently-active one still peek out (small,
// capped offset, still opaque). Anything further back than this fades out
// instead of continuing to accumulate offset — that unbounded accumulation
// (offset growing by index forever) was exactly what pushed the last few
// cards' bottom edges past the sticky frame's clipped boundary.
const MAX_VISIBLE_DEPTH = 2
const OFFSET_STEP = 28
const ENTER_OFFSET = 1400

export default function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project
  index: number
  total: number
  progress: MotionValue<number>
}) {
  // Cards further back end up more shrunk. Naturally evaluates to 1 for the
  // last card (nothing is ever stacked on top of it), so it never shrinks.
  const targetScale = 1 - (total - 1 - index) * 0.03

  // Later cards must paint above earlier ones so they physically cover them.
  const zIndex = index + 1

  const totalUnits = useMemo(() => getTotalUnits(total), [total])

  // "Depth" is a single continuous value — how many handoffs have completed
  // since THIS card became the active, front-most card — and position,
  // scale, and opacity are all derived from it, so the three always stay in
  // lockstep instead of drifting apart on separate timelines:
  //   depth < -1        → hasn't arrived yet, fully off-frame
  //   depth -1 .. 0      → sliding into place (this card's own entrance)
  //   depth 0 .. MAX     → settled, peeking behind newer cards (capped)
  //   depth > MAX        → faded out
  const rawDepth = useTransform(progress, (p) => {
    const unitPosition = p * totalUnits
    const completedHandoffs = Math.max(0, unitPosition - INITIAL_BUFFER)
    return completedHandoffs - index
  })
  const depth = useSpring(rawDepth, { stiffness: 300, damping: 40, mass: 0.5 })

  const y = useTransform(depth, [-1, 0, MAX_VISIBLE_DEPTH], [ENTER_OFFSET, 0, MAX_VISIBLE_DEPTH * OFFSET_STEP])
  const scale = useTransform(depth, [0, 1], [1, targetScale])
  const opacity = useTransform(depth, [MAX_VISIBLE_DEPTH, MAX_VISIBLE_DEPTH + 1], [1, 0])

  const displayNumber = String(index + 1).padStart(2, "0")
  const images = project.coverImages ?? []
  const category = project.category ?? "Software Engineering"
  const showGithub = Boolean(project.github && project.github !== project.link)

  return (
    <motion.div
      style={{
        scale,
        y,
        opacity,
        zIndex,
        willChange: "transform, opacity",
      }}
      className="absolute inset-x-0 top-0 origin-top rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8 overflow-hidden"
    >
      {/* Top row: number / category / title / actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-4 sm:gap-6 min-w-0">
          <span className="shrink-0 text-4xl sm:text-5xl md:text-6xl font-black text-white/10 leading-none">
            {displayNumber}
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-purple-400 mb-2">
              {category}
            </p>
            {/* min-h reserves space for 2 lines at every breakpoint, whether
                this title actually needs 1 or 2 — otherwise a card with a
                longer title (e.g. wraps to 2 lines) ends up visibly taller
                than its neighbors, and that mismatch shows up as an ugly
                overhang where a taller card peeks out past a shorter one
                that's supposed to be covering it. */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight min-h-[60px] sm:min-h-[75px] md:min-h-[90px]">
              {project.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showGithub && project.github && <GithubIconButton href={project.github} />}
          <LiveProjectButton href={project.link} />
        </div>
      </div>

      {/* Description — same fixed-lines reasoning as the title above. */}
      <p className="mt-4 sm:mt-6 text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl min-h-[46px] sm:min-h-[52px]">
        {project.summary ?? project.description}
      </p>

      {/* Image grid */}
      {images.length === 3 && <ProjectImageGrid images={images} category={category} title={project.title} />}
    </motion.div>
  )
}
