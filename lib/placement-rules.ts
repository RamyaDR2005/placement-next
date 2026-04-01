/**
 * Shared placement tier logic used across jobs, applications, and admin routes.
 */

export const TIER_ORDER = ["TIER_1", "TIER_2", "TIER_3"] as const
export type TierValue = (typeof TIER_ORDER)[number] | "DREAM" | null

/**
 * Determine the placement tier from salary and isDreamOffer flag.
 * DREAM is admin-set and bypasses salary thresholds.
 */
export function determineTier(salary: number | null, isDreamOffer: boolean): string {
  if (isDreamOffer) return "DREAM"
  if (!salary) return "TIER_3"
  if (salary > 9) return "TIER_1"
  if (salary > 5) return "TIER_2"
  return "TIER_3"
}

/**
 * Check whether a student is eligible to apply to a job tier given their current placement.
 *
 * Rules:
 * - Dream offers are open to everyone.
 * - Students with no placement can apply to any tier.
 * - TIER_1 placed → blocked from all further placements.
 * - TIER_2 placed → can only apply to TIER_1 jobs.
 * - TIER_3 placed → can apply to TIER_1 and TIER_2 jobs.
 */
export function canApplyToTier(
  studentTier: string | null,
  jobTier: string,
  isDreamOffer: boolean
): { eligible: boolean; reason?: string } {
  if (isDreamOffer) {
    return { eligible: true }
  }

  if (!studentTier) {
    return { eligible: true }
  }

  if (studentTier === "TIER_1") {
    return {
      eligible: false,
      reason: "You are already placed in Tier 1 and blocked from further placements",
    }
  }

  if (studentTier === "TIER_2") {
    if (jobTier === "TIER_1") {
      return { eligible: true }
    }
    return {
      eligible: false,
      reason: "You are placed in Tier 2. You can only apply for Tier 1 jobs (>9 LPA)",
    }
  }

  if (studentTier === "TIER_3") {
    if (jobTier === "TIER_1" || jobTier === "TIER_2") {
      return { eligible: true }
    }
    return {
      eligible: false,
      reason: "You are placed in Tier 3. You can only apply for Tier 1 or Tier 2 jobs",
    }
  }

  return { eligible: true }
}

/**
 * From a list of placements, return the highest tier (closest to TIER_1).
 * Returns null if the student has no placements.
 */
export function getHighestTier(placements: { tier: string }[]): string | null {
  if (placements.length === 0) return null
  return placements.reduce<string | null>((best, p) => {
    if (!best) return p.tier
    const bestIdx = TIER_ORDER.indexOf(best as (typeof TIER_ORDER)[number])
    const curIdx = TIER_ORDER.indexOf(p.tier as (typeof TIER_ORDER)[number])
    return curIdx < bestIdx ? p.tier : best
  }, null)
}
