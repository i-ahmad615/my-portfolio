import { describe, expect, it } from "vitest"
import { getEntriesByCategory, loadKnowledgeBase } from "./loader"

describe("loadKnowledgeBase", () => {
  it("loads entries for every known category", () => {
    const entries = loadKnowledgeBase()
    expect(entries.length).toBeGreaterThan(0)

    const categories = new Set(entries.map((entry) => entry.category))
    for (const category of ["profile", "projects", "skills", "experience", "education", "certifications", "services"]) {
      expect(categories.has(category as never)).toBe(true)
    }
  })

  it("gives every entry a keywords array (never undefined)", () => {
    const entries = loadKnowledgeBase()
    expect(entries.every((entry) => Array.isArray(entry.keywords))).toBe(true)
  })

  it("populates rich metadata on project entries (technologies, difficulty)", () => {
    const projectEntries = getEntriesByCategory("projects")
    const advancedWithTech = projectEntries.filter(
      (entry) => entry.keywords.length > 0 && entry.content.toLowerCase().includes("technologies used"),
    )
    expect(advancedWithTech.length).toBeGreaterThan(0)
  })

  it("includes the firewall automation project", () => {
    const projectEntries = getEntriesByCategory("projects")
    const firewall = projectEntries.find((entry) => entry.title.toLowerCase().includes("firewall"))
    expect(firewall).toBeDefined()
    expect(firewall?.keywords).toEqual(expect.arrayContaining(["cybersecurity"]))
  })

  it("includes experience position detail alongside the aggregate stats", () => {
    const experienceEntries = getEntriesByCategory("experience")
    expect(experienceEntries.length).toBeGreaterThan(1)
    const internship = experienceEntries.find((entry) => entry.content.toLowerCase().includes("cpbm"))
    expect(internship).toBeDefined()
  })

  it("returns entries scoped to a single category", () => {
    const projectEntries = getEntriesByCategory("projects")
    expect(projectEntries.length).toBeGreaterThan(0)
    expect(projectEntries.every((entry) => entry.category === "projects")).toBe(true)
  })

  it("caches the knowledge base across calls", () => {
    expect(loadKnowledgeBase()).toBe(loadKnowledgeBase())
  })
})
