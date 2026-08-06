import profileData from "../../content/profile.json"
import projectsData from "../../content/projects.json"
import skillsData from "../../content/skills.json"
import experienceData from "../../content/experience.json"
import educationData from "../../content/education.json"
import certificationsData from "../../content/certifications.json"
import servicesData from "../../content/services.json"
import faqData from "../../content/faq.json"
import type {
  Profile,
  Project,
  Skills,
  Experience,
  Education,
  Certifications,
  Service,
  FaqItem,
} from "../../types/content"
import type { KnowledgeEntry } from "./types"

// Each builder below turns one content/*.json file into KnowledgeEntry objects.
// New array items or object fields inside those files are picked up automatically —
// only a brand-new category (a new JSON file) would need a new builder here.
// `keywords` on each entry holds extra searchable terms (technologies, tags,
// category labels) beyond the natural-language `content`, used by the search
// engine's weighted scoring.

function buildProfileEntries(profile: Profile): KnowledgeEntry[] {
  const content = [
    `${profile.name} is a ${profile.title}.`,
    profile.aboutParagraphs.join(" "),
    `Based in ${profile.location}.`,
  ].join(" ")

  return [
    {
      id: "profile-summary",
      category: "profile",
      title: `${profile.name} — ${profile.title}`,
      content,
      keywords: ["profile", "about", "bio", "who is ahmad", "introduction", profile.title, profile.location],
      raw: profile,
    },
  ]
}

function buildProjectEntries(projects: Project[]): KnowledgeEntry[] {
  return projects.map((project, index) => {
    const contentParts = [
      project.summary ?? project.description,
      project.summary && project.summary !== project.description ? project.description : "",
      project.highlights?.length ? `Highlights: ${project.highlights.join("; ")}.` : "",
      project.technologies?.length ? `Technologies used: ${project.technologies.join(", ")}.` : "",
      project.category ? `Category: ${project.category}.` : "",
    ].filter(Boolean)

    return {
      id: `projects-${index}`,
      category: "projects",
      title: project.title,
      content: contentParts.join(" "),
      keywords: [
        ...(project.technologies ?? []),
        ...(project.keywords ?? []),
        ...(project.category ? [project.category] : []),
        ...(project.difficulty ? [project.difficulty] : []),
      ],
      raw: project,
    }
  })
}

function buildSkillEntries(skills: Skills): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = skills.technical.map((category, index) => ({
    id: `skills-technical-${index}`,
    category: "skills",
    title: category.title,
    content: `${category.title} skills: ${category.skills.join(", ")}.${
      category.proficiency ? ` Proficiency level: ${category.proficiency}.` : ""
    }`,
    keywords: [...category.skills, category.title],
    raw: category,
  }))

  entries.push({
    id: "skills-soft",
    category: "skills",
    title: "Soft Skills",
    content: `Soft skills: ${skills.soft.join(", ")}.`,
    keywords: skills.soft,
    raw: skills.soft,
  })

  entries.push({
    id: "skills-tools",
    category: "skills",
    title: "Tools",
    content: `Tools and software used: ${skills.tools.join(", ")}.`,
    keywords: skills.tools,
    raw: skills.tools,
  })

  const additional = skills.additionalTechnologies
  if (additional?.backend?.length) {
    entries.push({
      id: "skills-backend",
      category: "skills",
      title: "Backend Development",
      content: `Backend and server-side technologies: ${additional.backend.join(", ")}.`,
      keywords: [...additional.backend, "backend", "server-side", "api"],
      raw: additional.backend,
    })
  }
  if (additional?.frontend?.length) {
    entries.push({
      id: "skills-frontend",
      category: "skills",
      title: "Frontend Development",
      content: `Frontend and UI technologies: ${additional.frontend.join(", ")}.`,
      keywords: [...additional.frontend, "frontend", "ui"],
      raw: additional.frontend,
    })
  }
  if (additional?.ai?.length) {
    entries.push({
      id: "skills-ai-tools",
      category: "skills",
      title: "AI Platforms & Tooling",
      content: `AI platforms and tooling: ${additional.ai.join(", ")}.`,
      keywords: [...additional.ai, "ai", "artificial intelligence", "llm"],
      raw: additional.ai,
    })
  }

  return entries
}

function buildExperienceEntries(experience: Experience): KnowledgeEntry[] {
  const summary = experience.stats.map((stat) => `${stat.label}: ${stat.number}`).join(", ")
  const entries: KnowledgeEntry[] = [
    {
      id: "experience-summary",
      category: "experience",
      title: experience.title,
      content: `${experience.title}. ${summary}.`,
      keywords: ["experience", "career", "professional"],
      raw: experience,
    },
  ]

  experience.positions?.forEach((position, index) => {
    const content = [
      `${position.title} at ${position.organization} (${position.period}).`,
      position.responsibilities.length ? `Responsibilities: ${position.responsibilities.join("; ")}.` : "",
      position.achievements.length ? `Achievements: ${position.achievements.join("; ")}.` : "",
      position.technologies.length ? `Technologies used: ${position.technologies.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ")

    entries.push({
      id: `experience-position-${index}`,
      category: "experience",
      title: `${position.title}, ${position.organization}`,
      content,
      keywords: [...position.technologies, position.organization, position.title, "internship"],
      raw: position,
    })
  })

  return entries
}

function buildEducationEntries(education: Education): KnowledgeEntry[] {
  const summary = education.stats.map((stat) => `${stat.label}: ${stat.number}`).join(", ")
  const entries: KnowledgeEntry[] = [
    {
      id: "education-summary",
      category: "education",
      title: education.title,
      content: `${education.title}. ${summary}.`,
      keywords: ["education", "degree", "university"],
      raw: education,
    },
  ]

  const details = education.details
  if (details) {
    const content = [
      `${details.degree} at ${details.institution}, expected graduation ${details.graduationYear}, CGPA ${details.cgpa}.`,
      details.highlights.length ? `Highlights: ${details.highlights.join("; ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ")

    entries.push({
      id: "education-details",
      category: "education",
      title: `${details.degree}, ${details.institution}`,
      content,
      keywords: [details.institution, details.degree, "cgpa", "gpa", "graduation", "qualification"],
      raw: details,
    })
  }

  return entries
}

function buildCertificationEntries(certifications: Certifications): KnowledgeEntry[] {
  const summary = certifications.stats.map((stat) => `${stat.label}: ${stat.number}`).join(", ")
  const entries: KnowledgeEntry[] = [
    {
      id: "certifications-summary",
      category: "certifications",
      title: certifications.title,
      content: `${certifications.title}. ${summary}.`,
      keywords: ["certifications", "certificates", "courses"],
      raw: certifications,
    },
  ]

  certifications.items.forEach((item, index) => {
    const datePart = item.date ? ` (${item.date})` : ""
    const platformPart = item.platform ? ` via ${item.platform}` : ""
    const skillsPart = item.skillsGained?.length ? ` Skills gained: ${item.skillsGained.join(", ")}.` : ""

    entries.push({
      id: `certifications-item-${index}`,
      category: "certifications",
      title: item.name,
      content: `${item.name}, issued by ${item.issuer}${platformPart}${datePart}.${skillsPart}`,
      keywords: [item.name, item.issuer, ...(item.skillsGained ?? [])],
      raw: item,
    })
  })

  return entries
}

function buildServiceEntries(services: Service[]): KnowledgeEntry[] {
  return services.map((service, index) => ({
    id: `services-${index}`,
    category: "services",
    title: service.title,
    content: `${service.title}: ${service.description}`,
    keywords: [service.title],
    raw: service,
  }))
}

function buildFaqEntries(faqs: FaqItem[]): KnowledgeEntry[] {
  return faqs.map((faq, index) => ({
    id: `faq-${index}`,
    category: "faq",
    title: faq.question,
    content: `${faq.question} ${faq.answer}`,
    keywords: [],
    raw: faq,
  }))
}

let knowledgeBaseCache: KnowledgeEntry[] | null = null

/** Loads and flattens all content/*.json files into a single searchable knowledge base. */
export function loadKnowledgeBase(): KnowledgeEntry[] {
  if (knowledgeBaseCache) return knowledgeBaseCache

  knowledgeBaseCache = [
    ...buildProfileEntries(profileData as Profile),
    ...buildProjectEntries(projectsData as Project[]),
    ...buildSkillEntries(skillsData as Skills),
    ...buildExperienceEntries(experienceData as Experience),
    ...buildEducationEntries(educationData as Education),
    ...buildCertificationEntries(certificationsData as Certifications),
    ...buildServiceEntries(servicesData as Service[]),
    ...buildFaqEntries(faqData as FaqItem[]),
  ]

  return knowledgeBaseCache
}

export function getEntriesByCategory(category: KnowledgeEntry["category"]): KnowledgeEntry[] {
  return loadKnowledgeBase().filter((entry) => entry.category === category)
}
