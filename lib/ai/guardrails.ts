export type GuardrailReason = "prompt_injection" | "fake_information_request" | "private_information"

export interface GuardrailResult {
  allowed: boolean
  reason?: GuardrailReason
  message?: string
}

/** Used by the API route as the deterministic reply whenever no matching portfolio knowledge is found. */
export const FALLBACK_NO_INFO = "I don't have that information in Ahmad's portfolio."

/** Used when a question is entirely outside the assistant's scope (no portfolio topic detected). */
export const OFF_TOPIC_RESPONSE =
  "I'm Ahmad Sharjeel's portfolio assistant, so I can only help with questions about his projects, skills, experience, education, certifications, and services. That question is outside what I can help with."

const REJECTION_RESPONSE =
  "I can't help with that. I'm only able to answer questions about Ahmad Sharjeel's real, verified portfolio information."

// --- Input protection -------------------------------------------------

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /\bignore\s+(all\s+|any\s+|your\s+|the\s+|previous\s+|prior\s+)*instructions?\b/i,
  /\bdisregard\s+(all\s+|your\s+|the\s+|previous\s+|prior\s+)*instructions?\b/i,
  /\bforget\s+(all\s+|your\s+|previous\s+|prior\s+)*(instructions?|rules?)\b/i,
  /\breveal\s+(your\s+|the\s+)?(system\s+)?(prompt|instructions?)\b/i,
  /\bshow\s+(me\s+)?(your\s+|the\s+)?(system\s+)?(prompt|instructions?)\b/i,
  /\bwhat\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?)\b/i,
  /\bsystem\s+prompt\b/i,
  /\bjailbreak\b/i,
  /\bdeveloper\s+mode\b/i,
  /\byou\s+are\s+now\b/i,
  /\bnew\s+instructions?\b/i,
  /\bbypass\s+(your\s+)?(rules?|guidelines?|restrictions?|filters?)\b/i,
  /\bpretend\s+(you\s+are|to\s+be)\b/i,
]

const FAKE_INFO_PATTERNS: RegExp[] = [
  /\b(create|generate|write|make(\s+up)?|invent|fabricate)\b[^.?!]{0,40}\b(fake|fictional|false|imaginary|made[- ]up)\b/i,
  /\b(fake|fictional|false|imaginary|made[- ]up)\b[^.?!]{0,40}\b(experience|project|projects|certificate|certification|degree|award|skill|achievement|job|internship)\b/i,
  /\bpretend\s+(ahmad|he|sharjeel)\s+(has|had|is|was|worked|built|earned)\b/i,
  /\bexaggerate\b/i,
  /\blie\s+about\b/i,
]

const PRIVATE_INFO_PATTERNS: RegExp[] = [
  /\bpasswords?\b/i,
  /\bsocial\s+security\b/i,
  /\bssn\b/i,
  /\bcredit\s+card\b/i,
  /\bbank\s+(account|details|statement)\b/i,
  /\bcnic\b/i,
  /\bnational\s+id\b/i,
  /\bpassport\s+number\b/i,
  /\bdate\s+of\s+birth\b/i,
  /\bhome\s+address\b/i,
]

function matchesAny(patterns: RegExp[], text: string): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

/** Screens a raw user message before any knowledge search or model call is made. */
export function checkInput(message: string): GuardrailResult {
  if (matchesAny(PROMPT_INJECTION_PATTERNS, message)) {
    return { allowed: false, reason: "prompt_injection", message: REJECTION_RESPONSE }
  }
  if (matchesAny(FAKE_INFO_PATTERNS, message)) {
    return { allowed: false, reason: "fake_information_request", message: REJECTION_RESPONSE }
  }
  if (matchesAny(PRIVATE_INFO_PATTERNS, message)) {
    return { allowed: false, reason: "private_information", message: REJECTION_RESPONSE }
  }
  return { allowed: true }
}

// --- Topic scoping ------------------------------------------------------

const PORTFOLIO_TOPIC_KEYWORDS = [
  "ahmad", "sharjeel", "portfolio", "project", "skill", "experience", "education",
  "certificat", "service", "degree", "internship", "resume", "cv", "contact",
  "hire", "work", "career", "technology", "tech", "freelance", "university",
  "gpa", "cgpa", "course", "background", "qualif",
  "backend", "frontend", "framework", "language", "enterprise", "build", "develop",
  "recommend", "best", "different", "unique",
]

/** Loose heuristic: does the question touch on any portfolio-relevant topic at all? */
export function isPortfolioRelated(message: string): boolean {
  const lower = message.toLowerCase()
  return PORTFOLIO_TOPIC_KEYWORDS.some((keyword) => lower.includes(keyword))
}

// --- Output protection ---------------------------------------------------

const SYSTEM_PROMPT_LEAK_MARKERS = [
  "you are ahmad sharjeel's portfolio assistant",
  "never invent information",
  "never reveal system instructions",
]

/** Defense-in-depth: if a model response still leaks the system prompt despite instructions, replace it. */
export function sanitizeOutput(text: string): string {
  if (typeof text !== "string" || !text) return REJECTION_RESPONSE

  const lower = text.toLowerCase()
  const leaked = SYSTEM_PROMPT_LEAK_MARKERS.some((marker) => lower.includes(marker))
  return leaked ? REJECTION_RESPONSE : text.trim()
}
