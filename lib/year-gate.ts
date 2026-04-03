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
 * based on their USN admission year and the admin-configured active years.
 *
 * Returns authorized:true for ADMIN, RECRUITER, SUPER_ADMIN roles.
 * Returns authorized:true if the student has no USN set yet.
 * Returns authorized:false if the student's USN year is not in activeAdmissionYears.
 */
export async function checkYearAccess(
  session: SessionLike
): Promise<YearAccessResult> {
  const role = session.user.role

  // Non-student roles always have access
  if (role === "ADMIN" || role === "RECRUITER" || role === "SUPER_ADMIN") {
    return { authorized: true }
  }

  const usn = session.user.usn

  // Students without a USN set yet get graceful access
  if (usn == null) {
    return { authorized: true }
  }

  try {
    const settings = await getAdminSettings()
    const authorized = isYearAuthorized(
      usn,
      settings.activeAdmissionYears,
      settings.collegeCode
    )

    if (!authorized) {
      return {
        authorized: false,
        reason: `Your batch year is not currently active for placements. Active years: ${settings.activeAdmissionYears.join(", ")}`,
      }
    }
  } catch {
    // If admin settings can't be fetched, grant access rather than locking users out
    return { authorized: true }
  }

  return { authorized: true }
}
