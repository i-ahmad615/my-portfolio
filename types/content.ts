export interface SocialLinks {
  github: string
  linkedin: string
  linkedinContact: string
  emailHref: string
  whatsapp: string
}

export interface QuickStat {
  number: string
  label: string
}

export interface Profile {
  name: string
  title: string
  tagline: string
  motivationalQuotes: string[]
  aboutParagraphs: string[]
  profileImage: string
  cvUrl: string
  email: string
  phone: string
  location: string
  social: SocialLinks
  quickStats: QuickStat[]
}

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced"

export interface Project {
  title: string
  description: string
  link: string
  summary?: string
  technologies?: string[]
  category?: string
  highlights?: string[]
  difficulty?: ProjectDifficulty
  keywords?: string[]
  /** Local paths under /public, e.g. "/projects/firewall-automation-1.png". Exactly 3 expected by the projects section's image grid. */
  coverImages?: string[]
  github?: string
}

export interface SkillCategory {
  icon: string
  title: string
  skills: string[]
  proficiency?: string
}

export interface AdditionalTechnologies {
  backend?: string[]
  frontend?: string[]
  ai?: string[]
}

export interface Skills {
  technical: SkillCategory[]
  soft: string[]
  tools: string[]
  additionalTechnologies?: AdditionalTechnologies
}

export interface StatItem {
  icon: string
  number: string
  label: string
}

export interface StatBlock {
  title: string
  stats: StatItem[]
}

export interface ExperiencePosition {
  title: string
  organization: string
  period: string
  responsibilities: string[]
  technologies: string[]
  achievements: string[]
}

export interface Experience extends StatBlock {
  positions?: ExperiencePosition[]
}

export interface EducationDetails {
  institution: string
  degree: string
  cgpa: string
  graduationYear: string
  highlights: string[]
}

export interface Education extends StatBlock {
  details?: EducationDetails
}

export interface CertificationItem {
  name: string
  issuer: string
  date?: string
  link?: string
  skillsGained?: string[]
  platform?: string
}

export interface Certifications extends StatBlock {
  items: CertificationItem[]
}

export interface Service {
  title: string
  description: string
}

export interface Testimonial {
  name: string
  role: string
  text: string
  rating: number
}

export interface FaqItem {
  question: string
  answer: string
}
