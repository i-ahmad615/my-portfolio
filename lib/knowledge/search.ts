import { loadKnowledgeBase } from "./loader"
import { QUERY_EXPANSION } from "./synonyms"
import type { KnowledgeCategory, KnowledgeEntry, KnowledgeSearchResult } from "./types"
import type { Project } from "../../types/content"

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
  "do", "does", "did", "has", "have", "had", "having",
  "can", "could", "should", "would", "will", "shall", "may", "might",
  "i", "me", "my", "you", "your", "he", "she", "it", "we", "they", "them",
  "of", "in", "on", "at", "for", "to", "from", "with", "about", "into",
  "and", "or", "but", "if", "than", "as", "this", "that", "these", "those",
  "please", "tell", "know", "like", "more", "some", "any", "all",
  // The portfolio subject's own name appears in nearly every knowledge entry
  // (especially FAQ answers, which are written in third person about him),
  // so it carries no discriminative signal for routing a query to a category.
  "ahmad", "sharjeel",
])

const CATEGORY_KEYWORDS: Record<KnowledgeCategory, string[]> = {
  profile: ["background", "introduce", "introduction", "bio", "biography", "summary"],
  projects: ["project", "projects", "built", "build", "developed", "develop", "app", "apps", "application", "applications", "portfolio", "github", "repo"],
  skills: ["skill", "skills", "technology", "technologies", "tech", "stack", "language", "languages", "tool", "tools", "proficient", "programming", "framework", "frameworks", "backend", "frontend"],
  experience: ["experience", "work", "worked", "job", "career", "professional", "internship", "employer", "employment"],
  education: ["education", "degree", "university", "college", "gpa", "cgpa", "study", "studied", "graduate", "graduation", "school", "qualification", "qualifications"],
  certifications: ["certificate", "certificates", "certification", "certifications", "course", "courses", "credential", "credentials"],
  services: ["service", "services", "hire", "offer", "offers", "offering", "consulting", "freelance"],
  faq: ["faq", "faqs", "question", "questions"],
}

// Categories consulted for "who is Ahmad" / "tell me about Ahmad" style identity questions.
const IDENTITY_CATEGORIES: KnowledgeCategory[] = ["profile", "education", "experience"]

const IDENTITY_QUERY_PATTERN = /\b(who\s+is\s+ahmad|who\s+is\s+he|tell\s+me\s+about|introduce\s+(yourself|ahmad|him)|about\s+ahmad|describe\s+ahmad)\b/i
const BEST_PROJECTS_QUERY_PATTERN = /\b(best|top|most\s+impressive|greatest|strongest|standout|flagship)\b[^.?!]*\bproject/i

// Scoring weights — kept as a handful of simple, tunable constants rather
// than a full ranking model, per the "keep it lightweight" goal.
const WEIGHT_DIRECT_MATCH = 3
const WEIGHT_TITLE_BONUS = 2
const WEIGHT_KEYWORD_MATCH = 4
const WEIGHT_SYNONYM_MATCH = 1
const WEIGHT_CATEGORY_INTENT = 3
const WEIGHT_IDENTITY_BOOST = 5

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
}

/**
 * Does `term` appear inside `haystack`? Purely-alphanumeric terms are matched
 * at word boundaries to avoid short terms accidentally matching inside
 * unrelated words (e.g. the keyword "api" is NOT a match for "capital",
 * even though "capital" contains the literal substring "api"). Terms with
 * punctuation (e.g. "next.js", "c/c++") fall back to plain substring
 * matching, since word-boundary regex doesn't handle those cleanly anyway.
 */
function containsTerm(haystack: string, term: string): boolean {
  if (!term) return false
  if (/^[a-z0-9]+$/i.test(term)) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(`\\b${escaped}\\b`, "i").test(haystack)
  }
  return haystack.includes(term.toLowerCase())
}

/** Bidirectional relatedness check used for matching against entry.keywords. */
function termsRelated(a: string, b: string): boolean {
  return containsTerm(a, b) || containsTerm(b, a)
}

/**
 * Expands a query's direct tokens into a set of related synonym/intent terms
 * (see synonyms.ts), so a question doesn't need Ahmad's exact wording to
 * find the right knowledge — e.g. "qualification" also pulls in "degree".
 */
function expandTokens(directTokens: string[]): { direct: Set<string>; expanded: Set<string> } {
  const direct = new Set(directTokens)
  const expanded = new Set<string>()

  for (const token of directTokens) {
    const related = QUERY_EXPANSION[token]
    if (!related) continue
    for (const term of related) {
      const lower = term.toLowerCase()
      if (!direct.has(lower)) expanded.add(lower)
    }
  }

  return { direct, expanded }
}

/** Ranks project entries for "best/top/most impressive projects" style questions. */
function computeProjectRankingBoost(entry: KnowledgeEntry): number {
  const project = entry.raw as Partial<Project> | undefined
  let boost = 0

  if (project?.difficulty === "advanced") boost += 3
  else if (project?.difficulty === "intermediate") boost += 1

  const signalText = `${entry.content} ${entry.keywords.join(" ")}`.toLowerCase()
  const impactSignals = ["ai", "cybersecurity", "automation", "enterprise", "security", "machine learning"]
  for (const signal of impactSignals) {
    if (containsTerm(signalText, signal)) boost += 1.5
  }

  return boost
}

/**
 * Lightweight weighted-keyword search over the flattened knowledge base.
 *
 * Combines several signals per entry: direct token matches in its content,
 * a title-match bonus, matches against the entry's structured `keywords`
 * (technologies/tags), synonym/intent-expanded term matches, a category-intent
 * boost (does the query "smell like" this category), an identity boost for
 * "who is Ahmad" style questions, and a ranking boost for "best projects"
 * style questions. Results are then diversified across categories so a
 * multi-topic question (e.g. "who is Ahmad?") pulls from profile, education,
 * and experience together instead of only the single top-scoring category.
 */
export function searchKnowledge(query: string, limit = 8): KnowledgeSearchResult[] {
  const directTokens = tokenize(query)
  const isIdentityQuery = IDENTITY_QUERY_PATTERN.test(query)
  const isBestProjectsQuery = BEST_PROJECTS_QUERY_PATTERN.test(query)

  // Identity/ranking questions ("Who is Ahmad?", "Tell me about Ahmad") are
  // often made up entirely of stopwords once tokenized, so they must not be
  // short-circuited here — the identity/ranking boosts below are what surface
  // results for them even with zero direct tokens.
  if (directTokens.length === 0 && !isIdentityQuery && !isBestProjectsQuery) return []

  const { direct, expanded } = expandTokens(directTokens)

  const entries = loadKnowledgeBase()
  const scored: KnowledgeSearchResult[] = []

  for (const entry of entries) {
    const haystack = `${entry.title} ${entry.content}`.toLowerCase()
    const titleLower = entry.title.toLowerCase()
    const entryKeywordsLower = entry.keywords.map((keyword) => keyword.toLowerCase())
    let score = 0

    for (const token of direct) {
      if (containsTerm(haystack, token)) {
        score += WEIGHT_DIRECT_MATCH
        if (containsTerm(titleLower, token)) score += WEIGHT_TITLE_BONUS
      }
    }

    for (const term of expanded) {
      if (containsTerm(haystack, term)) score += WEIGHT_SYNONYM_MATCH
    }

    const allTerms = new Set([...direct, ...expanded])
    for (const keyword of entryKeywordsLower) {
      for (const term of allTerms) {
        if (termsRelated(keyword, term)) {
          score += WEIGHT_KEYWORD_MATCH
          break
        }
      }
    }

    const categoryKeywords = CATEGORY_KEYWORDS[entry.category] ?? []
    const hasCategoryIntent = [...allTerms].some((term) => categoryKeywords.includes(term))
    if (hasCategoryIntent) score += WEIGHT_CATEGORY_INTENT

    if (isIdentityQuery && IDENTITY_CATEGORIES.includes(entry.category)) {
      score += WEIGHT_IDENTITY_BOOST
    }

    if (isBestProjectsQuery && entry.category === "projects") {
      score += computeProjectRankingBoost(entry)
    }

    if (score > 0) scored.push({ entry, score })
  }

  scored.sort((a, b) => b.score - a.score)

  const distinctCategories = new Set(scored.map((result) => result.entry.category))

  // How many results a single category may occupy. This is intent-aware
  // rather than purely score-driven, because incidental matches in other
  // categories (e.g. the word "projects" appearing inside the experience
  // stats) would otherwise crowd out the category the user actually wants.
  const categoryCap = (category: KnowledgeCategory): number => {
    if (isBestProjectsQuery) return category === "projects" ? limit : 1
    if (isIdentityQuery) return IDENTITY_CATEGORIES.includes(category) ? limit : 1
    // General case: only cap when multiple categories are genuinely
    // competing — a single-topic question should be free to fill the
    // whole result set from that one category.
    return distinctCategories.size <= 1 ? limit : 3
  }

  const diversified: KnowledgeSearchResult[] = []
  const categoryCounts = new Map<KnowledgeCategory, number>()

  for (const result of scored) {
    if (diversified.length >= limit) break
    const count = categoryCounts.get(result.entry.category) ?? 0
    if (count >= categoryCap(result.entry.category)) continue
    diversified.push(result)
    categoryCounts.set(result.entry.category, count + 1)
  }

  return diversified
}

export function searchByCategory(category: KnowledgeCategory): KnowledgeEntry[] {
  return loadKnowledgeBase().filter((entry) => entry.category === category)
}
