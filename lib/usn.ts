interface ParsedUSN {
  admissionYear: string
  branch: string
  rollNumber: string
}

/**
 * Parses a USN string into its components.
 * USN format: 2SD22CS076 -> collegeCode="2SD", admissionYear="22", branch="CS", rollNumber="076"
 */
export function parseUSN(
  usn: string,
  collegeCode: string
): ParsedUSN | null {
  if (!usn || !collegeCode) {
    return null
  }

  const upperUSN = usn.toUpperCase()
  const upperCode = collegeCode.toUpperCase()

  if (!upperUSN.startsWith(upperCode)) {
    return null
  }

  const remaining = upperUSN.slice(upperCode.length)

  // Expect at least 2 digits (year) + 2 chars (branch) + 1 digit (roll number)
  if (remaining.length < 5) {
    return null
  }

  const admissionYear = remaining.slice(0, 2)
  if (!/^\d{2}$/.test(admissionYear)) {
    return null
  }

  // Branch is the next 2 letters after year
  const branch = remaining.slice(2, 4)
  if (!/^[A-Z]{2}$/.test(branch)) {
    return null
  }

  const rollNumber = remaining.slice(4)
  if (!/^\d+$/.test(rollNumber)) {
    return null
  }

  return { admissionYear, branch, rollNumber }
}

/**
 * Checks if a student's USN year is in the list of active admission years.
 * Returns true if USN is null/undefined (student hasn't set USN yet — graceful handling).
 * Returns true if parsed year is in activeYears.
 * Returns false otherwise.
 */
export function isYearAuthorized(
  usn: string | null | undefined,
  activeYears: string[],
  collegeCode: string
): boolean {
  if (usn == null) {
    return true
  }

  const parsed = parseUSN(usn, collegeCode)
  if (!parsed) {
    return false
  }

  return activeYears.includes(parsed.admissionYear)
}
