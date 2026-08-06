import { afterEach, describe, expect, it, vi } from "vitest"
import { GroqProvider } from "./groq"

describe("GroqProvider", () => {
  const originalKey = process.env.GROQ_API_KEY
  const provider = new GroqProvider()

  afterEach(() => {
    process.env.GROQ_API_KEY = originalKey
    vi.unstubAllGlobals()
  })

  it("returns a fatal failure when GROQ_API_KEY is not set", async () => {
    delete process.env.GROQ_API_KEY
    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("fatal")
  })

  it("returns the model's text on a successful call", async () => {
    process.env.GROQ_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: "Hello from Groq." } }] }),
      }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.text).toBe("Hello from Groq.")
  })

  it("classifies a 429 response as recoverable", async () => {
    process.env.GROQ_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => "quota exceeded" }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.kind).toBe("recoverable")
      expect(result.status).toBe(429)
    }
  })

  it("classifies a 401 response as fatal (invalid API key)", async () => {
    process.env.GROQ_API_KEY = "bad-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "invalid api key" }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("fatal")
  })

  it("classifies a network failure as recoverable", async () => {
    process.env.GROQ_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("fetch failed")),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("recoverable")
  })
})
