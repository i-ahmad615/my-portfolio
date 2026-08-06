import type { AIProvider, GenerateRequest, ProviderResult } from "./base"
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_TIMEOUT_MS, classifyStatus } from "./base"

// Calls the Gemini API directly over fetch — no SDK dependency required.
// "gemini-flash-latest" is a Google-maintained alias that always resolves to
// whichever current-generation flash model is available to the calling
// project — pinned model IDs (e.g. gemini-2.5-flash) can 404 for accounts
// created after Google restricts them to newer users only.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest"
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string; thought?: boolean }[]
    }
    finishReason?: string
  }[]
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini"

  async generate(request: GenerateRequest): Promise<ProviderResult> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        kind: "fatal",
        message: "GEMINI_API_KEY is not configured on the server.",
      }
    }

    // Gemini's API doesn't take a flat message list — history turns become
    // prior `contents` entries (assistant → role "model"), the system prompt
    // stays separate as `systemInstruction`.
    const contents = [
      ...(request.history ?? []).map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      })),
      { role: "user", parts: [{ text: request.userMessage }] },
    ]

    let response: Response
    try {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.systemPrompt }] },
          contents,
          generationConfig: {
            temperature: request.temperature ?? DEFAULT_TEMPERATURE,
            // Generous headroom: current-generation flash models can spend part
            // of maxOutputTokens on internal "thinking" before the visible
            // answer, which silently truncated replies at a lower cap.
            maxOutputTokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
            // Disable thinking where the model supports it — this is a factual,
            // retrieval-grounded assistant, not a reasoning task, so every
            // token should go to the visible answer. Models that don't
            // recognize this field simply ignore it.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError"
      return {
        ok: false,
        provider: this.name,
        kind: "recoverable",
        message: `${timedOut ? "Request timed out" : "Network failure"} calling Gemini: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }
    }

    if (!response.ok) {
      const status = response.status
      const bodyText = await response.text().catch(() => "")
      return {
        ok: false,
        provider: this.name,
        kind: classifyStatus(status),
        status,
        message: `Gemini API request failed (${status}): ${bodyText}`,
      }
    }

    const data = (await response.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    // Skip internal "thought" parts if the model includes them despite thinkingBudget: 0 —
    // only the actual visible answer should ever reach the user.
    const text = parts
      .filter((part) => !part.thought)
      .map((part) => part.text ?? "")
      .join("")
      .trim()

    if (!text) {
      return {
        ok: false,
        provider: this.name,
        kind: "recoverable",
        message: "Gemini API returned an empty response.",
      }
    }

    return { ok: true, provider: this.name, text }
  }
}
