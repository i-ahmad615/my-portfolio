"use client"

import ProjectImage from "./ProjectImage"

export default function ProjectImageGrid({
  images,
  category,
  title,
}: {
  images: string[]
  category: string
  title: string
}) {
  const [topLeft, bottomLeft, right] = images

  return (
    <div className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-[40%_60%] gap-3 sm:gap-4 md:gap-5">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
        <ProjectImage
          src={topLeft}
          category={category}
          title={title}
          alt={`${title} — preview 1`}
          heightStyle="clamp(70px, min(8vw, 10vh), 130px)"
        />
        <ProjectImage
          src={bottomLeft}
          category={category}
          title={title}
          alt={`${title} — preview 2`}
          heightStyle="clamp(90px, min(11vw, 13vh), 170px)"
        />
      </div>

      <ProjectImage
        src={right}
        category={category}
        title={title}
        alt={`${title} — preview 3`}
        heightStyle="100%"
        className="h-full"
      />
    </div>
  )
}
