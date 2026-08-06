import type { AIProvider, GenerateRequest, ProviderResult } from "./base"
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, DEFAULT_TIMEOUT_MS, classifyStatus } from "./base"

// Groq exposes an OpenAI-compatible Chat Completions API — no SDK dependency required.
// Model IDs on Groq rotate as new ones become GA and older previews retire, so this is
// deliberately overridable via GROQ_MODEL rather than hardcoded with no escape hatch.
// Check https://console.groq.com/docs/models for the current recommended flagship model.
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

interface GroqChatResponse {
  choices?: { message?: { content?: string } }[]
}

export class GroqProvider implements AIProvider {
  readonly name = "groq"

  async generate(request: GenerateRequest): Promise<ProviderResult> {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        kind: "fatal",
        message: "GROQ_API_KEY is not configured on the server.",
      }
    }

    const messages = [
      { role: "system", content: request.systemPrompt },
      ...(request.history ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
      { role: "user", content: request.userMessage },
    ]

    let response: Response
    try {
      response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: request.temperature ?? DEFAULT_TEMPERATURE,
          max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        }),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      })
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError"
      return {
        ok: false,
        provider: this.name,
        kind: "recoverable",
        message: `${timedOut ? "Request timed out" : "Network failure"} calling Groq: ${
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
        message: `Groq API request failed (${status}): ${bodyText}`,
      }
    }

    const data = (await response.json()) as GroqChatResponse
    const text = data.choices?.[0]?.message?.content?.trim() ?? ""

    if (!text) {
      return {
        ok: false,
        provider: this.name,
        kind: "recoverable",
        message: "Groq API returned an empty response.",
      }
    }

    return { ok: true, provider: this.name, text }
  }
}
