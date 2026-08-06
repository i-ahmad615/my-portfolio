import { describe, expect, it } from "vitest"
import { searchKnowledge } from "./search"

describe("searchKnowledge — direct and category matching", () => {
  it("routes a certifications question to the certifications category", () => {
    const results = searchKnowledge("What certificates does Ahmad have?")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entry.category).toBe("certifications")
  })

  it("routes a projects question to the projects category", () => {
    const results = searchKnowledge("What cybersecurity projects has Ahmad built?")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entry.category).toBe("projects")
  })

  it("returns nothing for an empty or meaningless query", () => {
    expect(searchKnowledge("")).toEqual([])
    expect(searchKnowledge("the a of")).toEqual([])
  })
})

describe("searchKnowledge — synonym / intent expansion", () => {
  it("maps 'qualification' to education knowledge", () => {
    const results = searchKnowledge("What is Ahmad's qualification?")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.entry.category === "education")).toBe(true)
  })

  it("maps 'backend' to backend technologies even though the word never appears verbatim in skills.json's rendered pill list", () => {
    const results = searchKnowledge("What backend frameworks does Ahmad know?")
    expect(results.length).toBeGreaterThan(0)
    const combinedContent = results.map((r) => r.entry.content.toLowerCase()).join(" ")
    expect(combinedContent).toMatch(/fastapi|python/)
  })

  it("maps 'AI' to machine learning / LLM related knowledge", () => {
    const results = searchKnowledge("What AI technologies does Ahmad work with?")
    expect(results.length).toBeGreaterThan(0)
    const combinedContent = results.map((r) => r.entry.content.toLowerCase()).join(" ")
    expect(combinedContent).toMatch(/gemini|openai|ai|automation/)
  })
})

describe("searchKnowledge — multi-category context building", () => {
  it("combines profile, education, and experience for an identity question", () => {
    const results = searchKnowledge("Who is Ahmad?")
    expect(results.length).toBeGreaterThan(0)
    const categories = new Set(results.map((r) => r.entry.category))
    expect(categories.has("profile")).toBe(true)
    expect(categories.has("education") || categories.has("experience")).toBe(true)
  })

  it("also works for 'Tell me about Ahmad' phrasing", () => {
    const results = searchKnowledge("Tell me about Ahmad.")
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.entry.category === "profile")).toBe(true)
  })
})

describe("searchKnowledge — best-projects ranking", () => {
  it("ranks advanced/AI/cybersecurity projects above simpler ones for a 'best projects' question", () => {
    const results = searchKnowledge("What are Ahmad's best projects?")
    const projectResults = results.filter((r) => r.entry.category === "projects")
    expect(projectResults.length).toBeGreaterThan(0)

    const topProject = projectResults[0].entry.raw as { difficulty?: string; title: string }
    expect(topProject.difficulty).toBe("advanced")
  })

  it("does not cap projects to 3 results when projects is the only relevant category", () => {
    const results = searchKnowledge("What are Ahmad's most impressive projects?")
    const projectResults = results.filter((r) => r.entry.category === "projects")
    expect(projectResults.length).toBeGreaterThan(3)
  })

  it("finds the firewall project specifically when asked about it directly", () => {
    const results = searchKnowledge("Tell me about the firewall project.")
    expect(results.some((r) => r.entry.title.toLowerCase().includes("firewall"))).toBe(true)
  })
})

// Deterministic retrieval-layer coverage for the full Task 9 example question
// set — confirms the right knowledge is found for each, independent of the
// live Gemini call (which is nondeterministic and quota-limited).
describe("searchKnowledge — Task 9 example question set", () => {
  const cases: [string, string][] = [
    ["Who is Ahmad?", "profile"],
    ["Tell me about Ahmad.", "profile"],
    ["What is Ahmad's experience?", "experience"],
    ["What backend frameworks does Ahmad know?", "skills"],
    ["What programming languages does Ahmad know?", "skills"],
    ["What certifications does Ahmad have?", "certifications"],
    ["What are Ahmad's best projects?", "projects"],
    ["Tell me about the firewall project.", "projects"],
    ["What is Ahmad's qualification?", "education"],
    ["What AI technologies does Ahmad work with?", "skills"],
  ]

  it.each(cases)("finds relevant knowledge for: %s", (question, expectedCategory) => {
    const results = searchKnowledge(question)
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.entry.category === expectedCategory)).toBe(true)
  })

  it("finds grounded content for evaluative questions (enterprise capability, differentiation, hiring)", () => {
    for (const question of [
      "Can Ahmad build enterprise software?",
      "What makes Ahmad different?",
      "Why should I hire Ahmad?",
    ]) {
      expect(searchKnowledge(question).length).toBeGreaterThan(0)
    }
  })
})
