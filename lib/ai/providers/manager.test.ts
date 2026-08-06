import { describe, expect, it, vi } from "vitest"
import { generateReply } from "./manager"
import type { AIProvider, GenerateRequest, ProviderResult } from "./base"

const REQUEST: GenerateRequest = { systemPrompt: "system", userMessage: "question" }

function fakeProvider(name: string, result: ProviderResult | (() => Promise<ProviderResult>)): AIProvider {
  return {
    name,
    generate: vi.fn(async () => (typeof result === "function" ? result() : result)),
  }
}

function success(provider: string, text: string): ProviderResult {
  return { ok: true, provider, text }
}

function failure(provider: string, kind: "recoverable" | "fatal", status?: number): ProviderResult {
  return { ok: false, provider, kind, status, message: `${provider} failed (${status ?? kind})` }
}

describe("generateReply — provider manager", () => {
  it("returns Groq's answer on success without touching Gemini", async () => {
    const groq = fakeProvider("groq", success("groq", "Groq's answer."))
    const gemini = fakeProvider("gemini", success("gemini", "Gemini's answer."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toEqual({ success: true, text: "Groq's answer." })
    expect(gemini.generate).not.toHaveBeenCalled()
  })

  it("falls back to Gemini when Groq returns 429 (quota exceeded)", async () => {
    const groq = fakeProvider("groq", failure("groq", "recoverable", 429))
    const gemini = fakeProvider("gemini", success("gemini", "Gemini's answer."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toEqual({ success: true, text: "Gemini's answer." })
    expect(gemini.generate).toHaveBeenCalledTimes(1)
  })

  it("falls back to Gemini when Groq times out", async () => {
    const groq = fakeProvider("groq", failure("groq", "recoverable"))
    const gemini = fakeProvider("gemini", success("gemini", "Gemini's answer."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toEqual({ success: true, text: "Gemini's answer." })
  })

  it("falls back to Gemini when Groq returns a 5xx server error", async () => {
    const groq = fakeProvider("groq", failure("groq", "recoverable", 503))
    const gemini = fakeProvider("gemini", success("gemini", "Gemini's answer."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toEqual({ success: true, text: "Gemini's answer." })
  })

  it("does NOT fall back when Groq's failure is fatal (e.g. invalid API key)", async () => {
    const groq = fakeProvider("groq", failure("groq", "fatal", 401))
    const gemini = fakeProvider("gemini", success("gemini", "Gemini's answer."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result.success).toBe(false)
    expect(gemini.generate).not.toHaveBeenCalled()
  })

  it("returns a friendly AI_UNAVAILABLE result when Gemini also fails (invalid Gemini API key)", async () => {
    const groq = fakeProvider("groq", failure("groq", "recoverable", 429))
    const gemini = fakeProvider("gemini", failure("gemini", "fatal", 401))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toEqual({
      success: false,
      code: "AI_UNAVAILABLE",
      message: "The AI assistant is temporarily unavailable. Please try again later.",
    })
  })

  it("never leaks a raw provider error message into the failure result", async () => {
    const groq = fakeProvider(
      "groq",
      failure("groq", "fatal", 401),
    )

    const result = await generateReply(REQUEST, [groq])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).not.toContain("groq failed")
    }
  })

  it("returns the unified success shape regardless of which provider answered", async () => {
    const groq = fakeProvider("groq", failure("groq", "recoverable"))
    const gemini = fakeProvider("gemini", success("gemini", "Answer from Gemini."))

    const result = await generateReply(REQUEST, [groq, gemini])

    expect(result).toHaveProperty("success", true)
    expect(result).toHaveProperty("text")
    expect(result).not.toHaveProperty("provider")
  })

  it("uses only Gemini, with no Groq attempt, when given a single-provider chain", async () => {
    const gemini = fakeProvider("gemini", success("gemini", "Direct Gemini answer."))

    const result = await generateReply(REQUEST, [gemini])

    expect(result).toEqual({ success: true, text: "Direct Gemini answer." })
  })
})
