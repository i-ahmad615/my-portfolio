import { NextResponse } from "next/server"
import { searchKnowledge } from "../../../lib/knowledge/search"
import { SYSTEM_PROMPT, buildUserPrompt } from "../../../lib/ai/prompt"
import { generateReply } from "../../../lib/ai/providers/manager"
import {
  FALLBACK_NO_INFO,
  OFF_TOPIC_RESPONSE,
  checkInput,
  isPortfolioRelated,
  sanitizeOutput,
} from "../../../lib/ai/guardrails"

const MAX_MESSAGE_LENGTH = 2000

interface ChatRequestBody {
  message?: unknown
}

export async function POST(request: Request) {
  let body: ChatRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "A non-empty 'message' field is required." }, { status: 400 })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 400 })
  }

  // Reject prompt injection, fake-information, and private-information requests
  // before any knowledge search or model call — no tokens spent on malicious input.
  const guardrail = checkInput(message)
  if (!guardrail.allowed) {
    return NextResponse.json({ reply: guardrail.message })
  }

  // Only the knowledge retrieved for this specific question is sent to the model,
  // instead of the full portfolio dataset, to keep token usage minimal.
  const knowledgeResults = searchKnowledge(message)

  // No matching knowledge — answer deterministically instead of asking the model
  // to guess. This also guarantees the exact required fallback wording.
  if (knowledgeResults.length === 0) {
    const reply = isPortfolioRelated(message) ? FALLBACK_NO_INFO : OFF_TOPIC_RESPONSE
    return NextResponse.json({ reply })
  }

  const userPrompt = buildUserPrompt(message, knowledgeResults)

  // The provider manager handles provider selection, retry, and fallback
  // internally (Groq primary, Gemini fallback) and never throws — this route
  // never knows or cares which provider actually answered.
  const result = await generateReply({ systemPrompt: SYSTEM_PROMPT, userMessage: userPrompt })

  if (!result.success) {
    // Never a raw 502/provider error to the client — the friendly message is
    // returned as a normal assistant reply, same shape as every other path.
    return NextResponse.json({ reply: result.message })
  }

  return NextResponse.json({ reply: sanitizeOutput(result.text) })
}
