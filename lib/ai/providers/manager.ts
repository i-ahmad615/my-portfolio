import type { AIProvider, GenerateRequest, ProviderFailure } from "./base"
import { GroqProvider } from "./groq"
import { GeminiProvider } from "./gemini"

export interface AIManagerSuccess {
  success: true
  text: string
}

export interface AIManagerFailure {
  success: false
  code: "AI_UNAVAILABLE"
  message: string
}

export type AIManagerResult = AIManagerSuccess | AIManagerFailure

const FRIENDLY_UNAVAILABLE_MESSAGE = "The AI assistant is temporarily unavailable. Please try again later."

// Registering a new provider (OpenRouter, Cerebras, Mistral, Claude, DeepSeek, ...)
// only requires: (1) a new file implementing AIProvider, (2) one line here.
// No other code — the manager, the route, and the frontend are unaffected.
const PROVIDER_REGISTRY: Record<string, () => AIProvider> = {
  groq: () => new GroqProvider(),
  gemini: () => new GeminiProvider(),
}

// The chain tried when AI_PROVIDER is unset or set to "groq" (the default posture).
const DEFAULT_CHAIN_ORDER = ["groq", "gemini"]

function resolveProviderChain(): AIProvider[] {
  const preferred = (process.env.AI_PROVIDER || "groq").toLowerCase()

  // An explicit, non-default provider means "use exactly this one" —
  // e.g. AI_PROVIDER=gemini talks to Gemini directly, no Groq attempt at all.
  if (preferred !== "groq" && PROVIDER_REGISTRY[preferred]) {
    return [PROVIDER_REGISTRY[preferred]()]
  }

  return DEFAULT_CHAIN_ORDER.filter((name) => PROVIDER_REGISTRY[name]).map((name) => PROVIDER_REGISTRY[name]())
}

function describeFailure(result: ProviderFailure): string {
  if (result.status === 429) return "Quota Exceeded"
  if (result.status && result.status >= 500) return "Server Error"
  if (result.kind === "fatal") return "Fatal Error"
  return "Recoverable Error"
}

function logStatus(provider: string, status: string, detail?: string) {
  console.log(`[AI] Provider: ${provider} | Status: ${status}${detail ? ` — ${detail}` : ""}`)
}

/**
 * Tries each provider in priority order (Groq → Gemini by default). A
 * recoverable failure (429, 5xx, timeout, network error) moves on to the
 * next provider in the chain. A fatal failure (missing/invalid API key,
 * malformed request) stops the chain immediately — it's logged, not
 * retried, since switching providers wouldn't fix a configuration problem.
 *
 * Always returns a structured result, never throws — the caller (the API
 * route) never needs provider-specific error handling, and on total failure
 * gets a single friendly message instead of a raw provider error or a 502.
 */
export async function generateReply(
  request: GenerateRequest,
  providers: AIProvider[] = resolveProviderChain(),
): Promise<AIManagerResult> {
  for (let index = 0; index < providers.length; index++) {
    const provider = providers[index]
    const hasNext = index < providers.length - 1
    const result = await provider.generate(request)

    if (result.ok) {
      logStatus(provider.name, "Success")
      return { success: true, text: result.text }
    }

    const status = describeFailure(result)

    if (result.kind === "fatal") {
      logStatus(provider.name, status, "no fallback attempted")
      console.error(`[AI] ${provider.name} fatal error:`, result.message)
      break
    }

    logStatus(provider.name, status, hasNext ? `switching to ${providers[index + 1].name}...` : undefined)
    if (!hasNext) {
      console.error(`[AI] ${provider.name} recoverable error (no more providers to try):`, result.message)
    }
  }

  // Always the same friendly, generic message to the caller — never a raw
  // provider error — regardless of which provider(s) failed or why.
  return {
    success: false,
    code: "AI_UNAVAILABLE",
    message: FRIENDLY_UNAVAILABLE_MESSAGE,
  }
}
