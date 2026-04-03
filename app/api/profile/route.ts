import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, logSecurityEvent } from "@/lib/auth-helpers"
import { profileUpdateSchema } from "@/lib/validations/profile"

// Fields returned to the client (excludes internal/admin-only fields)
const PROFILE_SELECT = {
  id: true,
  userId: true,
  kycStatus: true,
  isComplete: true,
  completionStep: true,
  createdAt: true,
  updatedAt: true,
  // Personal
  firstName: true,
  middleName: true,
  lastName: true,
  dateOfBirth: true,
  dobDay: true,
  dobMonth: true,
  dobYear: true,
  gender: true,
  bloodGroup: true,
  state: true,
  stateOfDomicile: true,
  nationality: true,
  category: true,
  casteCategory: true,
  profilePhoto: true,
  // Contact
  email: true,
  studentEmail: true,
  callingMobile: true,
  callingNumber: true,
  whatsappMobile: true,
  whatsappNumber: true,
  alternativeMobile: true,
  altNumber: true,
  fatherFirstName: true,
  fatherMiddleName: true,
  fatherLastName: true,
  fatherName: true,
  fatherDeceased: true,
  fatherMobile: true,
  fatherEmail: true,
  fatherOccupation: true,
  motherFirstName: true,
  motherMiddleName: true,
  motherLastName: true,
  motherName: true,
  motherDeceased: true,
  motherMobile: true,
  motherEmail: true,
  motherOccupation: true,
  guardianName: true,
  guardianPhone: true,
  guardianRelation: true,
  // Address
  currentHouse: true,
  currentCross: true,
  currentArea: true,
  currentDistrict: true,
  currentCity: true,
  currentState: true,
  currentPincode: true,
  currentAddress: true,
  sameAsCurrent: true,
  permanentHouse: true,
  permanentCross: true,
  permanentArea: true,
  permanentDistrict: true,
  permanentCity: true,
  permanentState: true,
  permanentPincode: true,
  permanentAddress: true,
  country: true,
  // 10th
  tenthSchool: true,
  tenthSchoolName: true,
  tenthArea: true,
  tenthDistrict: true,
  tenthCity: true,
  tenthAreaDistrictCity: true,
  tenthPincode: true,
  tenthState: true,
  tenthBoard: true,
  tenthPassingYear: true,
  tenthPassingMonth: true,
  tenthMarksType: true,
  tenthPercentage: true,
  tenthSubjects: true,
  tenthTotalMarks: true,
  tenthMarksOutOf1000: true,
  tenthMarksCard: true,
  // 12th
  academicLevel: true,
  hasCompletedTwelfth: true,
  twelfthSchool: true,
  twelfthSchoolName: true,
  twelfthArea: true,
  twelfthDistrict: true,
  twelfthCity: true,
  twelfthAreaDistrictCity: true,
  twelfthPincode: true,
  twelfthState: true,
  twelfthBoard: true,
  twelfthPassingYear: true,
  twelfthPassingMonth: true,
  twelfthMarksType: true,
  twelfthPercentage: true,
  twelfthSubjects: true,
  twelfthTotalMarks: true,
  twelfthMarksOutOf1000: true,
  twelfthMarksCard: true,
  twelfthCbseSubjects: true,
  twelfthCbseMarks: true,
  twelfthIcseMarks: true,
  // Diploma
  hasCompletedDiploma: true,
  diplomaCollege: true,
  diplomaCollegeName: true,
  diplomaArea: true,
  diplomaDistrict: true,
  diplomaCity: true,
  diplomaAreaLocation: true,
  diplomaCertificate: true,
  diplomaCertificates: true,
  diplomaSemesterSgpa: true,
  diplomaSemesters: true,
  diplomaYearMarks: true,
  diplomaFirstYear: true,
  diplomaSecondYear: true,
  diplomaThirdYear: true,
  diplomaPercentage: true,
  // Engineering
  collegeName: true,
  collegeDistrict: true,
  district: true,
  collegePincode: true,
  pincode: true,
  branch: true,
  entryType: true,
  seatCategory: true,
  usn: true,
  libraryId: true,
  residencyStatus: true,
  hostelName: true,
  hostelRoom: true,
  roomNumber: true,
  hostelFloor: true,
  floorNumber: true,
  city: true,
  localCity: true,
  transportMode: true,
  busRoute: true,
  batch: true,
  branchMentor: true,
  // Engineering Academics
  semesters: true,
  semesterRecords: true,
  semesterMarksCards: true,
  failedSubjects: true,
  clearedAfterFailure: true,
  // KYC / Final
  finalCgpa: true,
  hasBacklogs: true,
  activeBacklogs: true,
  backlogs: true,
  backlogSubjects: true,
  // Social
  linkedinLink: true,
  githubLink: true,
  leetcodeLink: true,
  linkedin: true,
  github: true,
  leetcode: true,
  portfolio: true,
  codechef: true,
  codeforces: true,
  hackerrank: true,
  // Documents
  resumeUpload: true,
  resume: true,
  // Professional
  skills: true,
  certifications: true,
  projects: true,
  internships: true,
  achievements: true,
  hobbies: true,
  languages: true,
  // Preferences
  expectedSalary: true,
  preferredLocations: true,
  jobType: true,
  workMode: true,
  // Compat
  phone: true,
  alternatePhone: true,
  course: true,
  specialization: true,
  semester: true,
  year: true,
  cgpa: true,
  percentage: true,
} as const

export async function GET() {
  try {
    const { error, session } = await requireAuth()
    if (error || !session) return error

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: PROFILE_SELECT,
    })

    return NextResponse.json({ profile })
  } catch (err) {
    console.error("GET /api/profile error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error || !session) return error

    const body: unknown = await request.json()

    // Parse and validate — unknown fields are stripped by Zod
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      )
    }

    // Strip undefined values so Prisma doesn't receive them as explicit nulls
    const validatedData = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    )

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...validatedData,
      },
      update: validatedData,
      select: PROFILE_SELECT,
    })

    logSecurityEvent("profile_upserted", {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, profile, message: "Profile updated successfully" })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: err.flatten().fieldErrors },
        { status: 422 }
      )
    }

    console.error("PUT /api/profile error:", err)

    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "USN already in use. Please check your USN and try again." },
        { status: 409 }
      )
    }

    logSecurityEvent("profile_update_error", {
      error: err instanceof Error ? err.message : "Unknown error",
    })

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
