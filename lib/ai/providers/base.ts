/** Provider-agnostic conversation turn, for future multi-turn support. */
export interface ChatTurn {
  role: "user" | "assistant"
  content: string
}

/**
 * Everything a provider needs to generate a reply. The system prompt and
 * user message (which already includes the retrieved portfolio context —
 * see lib/ai/prompt.ts's buildUserPrompt) are identical regardless of which
 * provider ends up serving the request, so a fallback never changes what
 * the model is asked.
 */
export interface GenerateRequest {
  systemPrompt: string
  userMessage: string
  history?: ChatTurn[]
  temperature?: number
  maxTokens?: number
}

export interface ProviderSuccess {
  ok: true
  provider: string
  text: string
}

/**
 * "recoverable" — a transient condition (rate limit, timeout, network blip,
 * 5xx) where trying the next provider in the chain is worth attempting.
 * "fatal" — a configuration or request problem (missing/invalid API key,
 * malformed request) where retrying with a different provider won't help;
 * the manager logs it and stops instead of failing over.
 */
export type ProviderErrorKind = "recoverable" | "fatal"

export interface ProviderFailure {
  ok: false
  provider: string
  kind: ProviderErrorKind
  status?: number
  /** Internal diagnostic detail for logs only — never shown to the end user. */
  message: string
}

export type ProviderResult = ProviderSuccess | ProviderFailure

export interface AIProvider {
  readonly name: string
  generate(request: GenerateRequest): Promise<ProviderResult>
}

export const DEFAULT_TEMPERATURE = 0.4
export const DEFAULT_MAX_TOKENS = 2048
export const DEFAULT_TIMEOUT_MS = 15000

/** HTTP status → error kind. 429 and 5xx are treated as transient/recoverable; everything else is fatal. */
export function classifyStatus(status: number): ProviderErrorKind {
  if (status === 429 || status >= 500) return "recoverable"
  return "fatal"
}
