export type KnowledgeCategory =
  | "profile"
  | "projects"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "services"
  | "faq"

export interface KnowledgeEntry {
  id: string
  category: KnowledgeCategory
  title: string
  content: string
  /** Extra searchable terms (technologies, tags, category labels) beyond the prose in `content`. */
  keywords: string[]
  raw: unknown
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry
  score: number
}
