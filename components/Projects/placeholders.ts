/**
 * Category/title → themed online fallback image, used only when a local
 * cover image in /public/projects fails to load. Built on placehold.co
 * rather than guessed real photo URLs, so the fallback itself can never 404 —
 * "never leave broken images" has to hold even for the fallback path.
 */
const THEMES: { match: RegExp; label: string }[] = [
  { match: /firewall|cybersecurity|incident response|network security/i, label: "Cybersecurity" },
  { match: /network|monitoring|dashboard/i, label: "Network+Dashboard" },
  { match: /\bai\b|artificial intelligence|assistant|chatbot|llm|machine learning/i, label: "Artificial+Intelligence" },
  { match: /game/i, label: "Game+Development" },
  { match: /compiler|lexical|developer tools/i, label: "Developer+Tools" },
  { match: /portfolio|full-stack|web development|marketplace|banking/i, label: "Software+Development" },
]

const DEFAULT_LABEL = "Software+Development"

export function getCategoryPlaceholder(category: string, title: string): string {
  const haystack = `${category} ${title}`
  const label = THEMES.find((theme) => theme.match.test(haystack))?.label ?? DEFAULT_LABEL
  return `https://placehold.co/800x600/0C0C0C/A855F7?font=montserrat&text=${label}`
}
