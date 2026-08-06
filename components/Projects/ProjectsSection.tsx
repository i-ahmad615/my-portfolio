"use client"

import { useRef } from "react"
import { useScroll } from "framer-motion"
import type { Project } from "../../types/content"
import SectionHeading from "./SectionHeading"
import ProjectCard from "./ProjectCard"
import { getContainerHeightVh } from "./stackTimeline"

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  // One shared sticky pin point for the ENTIRE stack, not one per card. The
  // outer div's height (see stackTimeline.ts) gives each card-to-card handoff
  // a full scroll unit to play out; the inner sticky wrapper stays pinned for
  // that whole duration, only releasing once the user has scrolled past the
  // last card — so no card can ever independently scroll out of frame on its own.
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  return (
    // NOTE: intentionally no overflow-hidden here. position: sticky breaks
    // silently on any element whose ancestor has overflow-hidden/auto/scroll —
    // that was previously on this <section> and is why the cards never moved.
    // The rounded-corner clipping this used to provide for the section's own
    // shape doesn't need overflow-hidden (border-radius already clips the
    // element's own background); only the cards themselves need a hard clip,
    // which is applied on the sticky wrapper below instead — safe, because
    // that's not an ancestor of the sticky element, it *is* the sticky element.
    <section
      id="projects"
      className="relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] bg-[#0C0C0C] pt-16 pb-16 md:pt-24 md:pb-24 px-4 md:px-8 lg:px-16"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="white-dot absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60"></div>
        <div className="white-dot absolute top-40 right-32 w-3 h-3 bg-white rounded-full opacity-40"></div>
        <div className="white-dot absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full opacity-80"></div>
        <div className="white-dot absolute top-60 left-1/2 w-2 h-2 bg-white rounded-full opacity-50"></div>
        <div className="white-dot absolute bottom-40 right-1/4 w-3 h-3 bg-white rounded-full opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto mb-12 md:mb-16">
        <SectionHeading gradient>Project</SectionHeading>
      </div>

      <div ref={containerRef} className="relative" style={{ height: `${getContainerHeightVh(projects.length)}vh` }}>
        {/* Height is derived from the viewport minus the sticky offset minus
            a small bottom margin — not a fixed 85vh — so the card always
            gets exactly whatever room is actually left below the header, on
            any screen height, instead of a fixed fraction that leaves a gap
            above and clips content below on shorter/taller viewports alike. */}
        <div className="sticky top-20 md:top-24 h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)] overflow-hidden">
          <div className="relative max-w-6xl mx-auto h-full">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={index}
                total={projects.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
