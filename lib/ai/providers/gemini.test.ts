import { afterEach, describe, expect, it, vi } from "vitest"
import { GeminiProvider } from "./gemini"

describe("GeminiProvider", () => {
  const originalKey = process.env.GEMINI_API_KEY
  const provider = new GeminiProvider()

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalKey
    vi.unstubAllGlobals()
  })

  it("returns a fatal failure when GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY
    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("fatal")
  })

  it("returns the model's text on a successful call", async () => {
    process.env.GEMINI_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Hello from Gemini." }] } }],
        }),
      }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.text).toBe("Hello from Gemini.")
  })

  it("filters out internal 'thought' parts and returns only the visible answer", async () => {
    process.env.GEMINI_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  { text: "internal reasoning the user should never see", thought: true },
                  { text: "The actual answer." },
                ],
              },
            },
          ],
        }),
      }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.text).toBe("The actual answer.")
  })

  it("classifies a 429 response as recoverable", async () => {
    process.env.GEMINI_API_KEY = "test-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => "quota exceeded" }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("recoverable")
  })

  it("classifies a 401 response as fatal (invalid API key)", async () => {
    process.env.GEMINI_API_KEY = "bad-key"
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "invalid api key" }),
    )

    const result = await provider.generate({ systemPrompt: "system", userMessage: "hello" })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.kind).toBe("fatal")
  })
})
