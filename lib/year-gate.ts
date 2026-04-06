import { prisma } from "@/lib/prisma"
import { getAdminSettings } from "@/lib/settings"
import { isYearAuthorized } from "@/lib/usn"

type YearAccessResult =
  | { authorized: true }
  | { authorized: false; reason: string }

interface SessionLike {
  user: {
    role?: string
    usn?: string | null
  }
}

/**
 * Checks whether the current session user is allowed to access student pages
 * based on their USN admission year and the active Batches in the DB.
 *
 * Returns authorized:true for ADMIN role.
 * Returns authorized:true if the student has no USN set yet.
 * Returns authorized:false if the student's USN year is not in any ACTIVE batch.
 */
export async function checkYearAccess(
  session: SessionLike
): Promise<YearAccessResult> {
  const role = session.user.role

  // Admins always have access
  if (role === "ADMIN") {
    return { authorized: true }
  }

  const usn = session.user.usn

  // Students without a USN set yet get graceful access
  if (usn == null) {
    return { authorized: true }
  }

  try {
    const [activeBatches, settings] = await Promise.all([
      prisma.batch.findMany({
        where: { status: "ACTIVE" },
        select: { admissionYear: true },
      }),
      getAdminSettings(),
    ])

    const activeYears = activeBatches.map((b) => b.admissionYear)

    // Fall back to all-access if no batches are configured yet
    if (activeYears.length === 0) {
      return { authorized: true }
    }

    const authorized = isYearAuthorized(usn, activeYears, settings.collegeCode)

    if (!authorized) {
      return {
        authorized: false,
        reason: `Your batch is not currently active for placements. Please contact the placement cell.`,
      }
    }
  } catch {
    // If DB is unavailable, grant access rather than locking users out
    return { authorized: true }
  }

  return { authorized: true }
}
