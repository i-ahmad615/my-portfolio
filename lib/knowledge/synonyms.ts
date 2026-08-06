/**
 * Query expansion map for the knowledge search engine.
 *
 * When a user's question contains a key below, the associated terms are
 * also searched for — so a question doesn't need to use Ahmad's exact
 * wording to find the right knowledge (e.g. "qualification" also matches
 * content mentioning "degree" or "CGPA").
 *
 * To extend: add a new `key: [...related terms]` entry. Keys should be
 * lowercase single words (the term as a user might type it); values can be
 * single words or short phrases and are matched as substrings, so multi-word
 * phrases like "machine learning" work as-is.
 */
export const QUERY_EXPANSION: Record<string, string[]> = {
  qualification: ["education", "degree", "university", "cgpa", "gpa", "graduate", "graduation"],
  qualifications: ["education", "degree", "university", "cgpa", "gpa", "graduate", "graduation"],
  qualified: ["education", "degree", "cgpa", "certification"],

  experience: ["internship", "work", "employment", "career", "job", "position", "professional"],
  worked: ["internship", "experience", "employment", "career"],
  employment: ["internship", "experience", "work", "career"],

  backend: ["fastapi", "flask", "python", "api", "apis", "server", "sql", "sqlite", "database"],
  frontend: ["react", "next.js", "nextjs", "typescript", "tailwind", "html", "css", "javascript"],
  fullstack: ["frontend", "backend", "react", "python", "fastapi", "sql"],
  framework: ["fastapi", "flask", "react", "next.js", "django"],
  frameworks: ["fastapi", "flask", "react", "next.js", "django"],

  ai: ["machine learning", "artificial intelligence", "llm", "gemini", "openai", "chatbot", "automation"],
  "a.i.": ["machine learning", "artificial intelligence", "llm", "gemini", "openai"],
  "machine learning": ["ai", "artificial intelligence", "llm", "python"],

  projects: ["project", "work", "applications", "systems", "built", "developed"],
  project: ["projects", "work", "applications", "systems", "built", "developed"],
  build: ["built", "developed", "created", "project"],
  built: ["developed", "created", "project", "build"],

  certificates: ["certifications", "certificate", "certification", "coursera", "google", "aws", "course"],
  certification: ["certificate", "certifications", "certificates", "course", "credential"],

  cybersecurity: ["security", "firewall", "network", "incident response", "threat"],
  security: ["cybersecurity", "firewall", "network monitoring"],

  hire: ["services", "skills", "experience", "projects", "consulting", "freelance"],
  enterprise: ["scalable", "secure", "production", "banking", "enterprise-grade", "internship"],
  different: ["unique", "strengths", "combination", "background"],
  unique: ["different", "strengths", "background"],

  languages: ["programming languages", "python", "javascript", "sql", "c++", "php"],
  programming: ["languages", "python", "javascript", "sql", "c++", "php", "development"],
}
