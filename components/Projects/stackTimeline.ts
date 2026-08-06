// Shared timeline math for the card-stack scroll interaction. Both
// ProjectsSection (which sizes the scroll container) and ProjectCard (which
// derives each card's depth-in-stack from scroll progress) must agree on
// the same units, or the scroll distance and the animated values drift
// out of sync with each other.

/**
 * Fraction of one handoff-unit reserved before the very first handoff
 * begins. Card 1 needs no entrance animation (it's already in place), so
 * without this there'd be either an instant, jarring stack the moment the
 * heading finishes, or — if that slot were sized like every other — a full
 * unit's worth of dead scroll with nothing happening. This gives it a
 * short, deliberate pause instead.
 */
export const INITIAL_BUFFER = 0.15

/** Total scroll "units" for a stack of this many cards: a short initial
 *  buffer plus one unit per card-to-card handoff (there are total-1 of them). */
export function getTotalUnits(total: number): number {
  return INITIAL_BUFFER + Math.max(total - 1, 0)
}

/** The scroll container's total height in vh, matching getTotalUnits 1:1. */
export function getContainerHeightVh(total: number): number {
  return getTotalUnits(total) * 100
}
