import { z } from "zod"

// ─── Reusable primitives ─────────────────────────────────────────────────────

const optionalString = z.string().nullish()
const optionalUrl    = z.string().url("Must be a valid URL").nullish()
const optionalEmail  = z.string().email("Must be a valid email").nullish()

// 10-digit Indian mobile (starts 6–9)
const indianMobile = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number")
  .nullish()

// Percentage 0–100
const percentage = z
  .number({ error: "Must be a number" })
  .min(0, "Cannot be negative")
  .max(100, "Cannot exceed 100")
  .nullish()

// GPA / CGPA 0–10
const gpa = z
  .number({ error: "Must be a number" })
  .min(0, "Cannot be negative")
  .max(10, "Cannot exceed 10")
  .nullish()

// Karnataka USN: e.g. 1SD22CS001
const usnSchema = z
  .string()
  .regex(
    /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/,
    "Invalid USN format (expected e.g. 1SD22CS001)"
  )
  .nullish()

// ─── Enum schemas (mirror Prisma enums exactly) ──────────────────────────────

const genderSchema       = z.enum(["MALE", "FEMALE"]).nullish()
const bloodGroupSchema   = z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE",
                                    "AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE"]).nullish()
const casteCategorySchema = z.enum(["GEN","OBC","SC","ST"]).nullish()
const boardSchema        = z.enum(["STATE","CBSE","ICSE"]).nullish()
const marksTypeSchema    = z.enum(["PERCENTAGE","SUBJECTS_TOTAL","OUT_OF_1000"]).nullish()
const branchSchema       = z.enum(["CSE","ISE","ECE","EEE","ME","CE","AIML","DS"]).nullish()
const entryTypeSchema    = z.enum(["REGULAR","LATERAL"]).nullish()
const seatCategorySchema = z.enum(["KCET","MANAGEMENT","COMEDK"]).nullish()
const residencySchema    = z.enum(["HOSTELITE","LOCALITE"]).nullish()
const transportSchema    = z.enum(["COLLEGE_BUS","PRIVATE_TRANSPORT","PUBLIC_TRANSPORT","WALKING"]).nullish()
const jobTypeSchema      = z.enum(["FULL_TIME","PART_TIME","INTERNSHIP","CONTRACT","FREELANCE"]).nullish()
const workModeSchema     = z.enum(["OFFICE","REMOTE","HYBRID","FLEXIBLE"]).nullish()

// ─── Full profile update schema ───────────────────────────────────────────────
// Every field is optional/nullish — all profile saves are partial.
// Fields NOT in this schema (kycStatus, verifiedBy, verifiedAt, remarks,
// userId, id, createdAt, updatedAt) are stripped by Zod before reaching Prisma.

export const profileUpdateSchema = z.object({

  // ── Completion tracking ──────────────────────────────────────────────────
  completionStep: z.number().int().min(1).max(5).optional(),
  isComplete:     z.boolean().optional(),

  // ── 1. Personal Information ───────────────────────────────────────────────
  firstName:      z.string().min(1, "First name is required").max(50).nullish(),
  middleName:     z.string().max(50).nullish(),
  lastName:       z.string().min(1, "Last name is required").max(50).nullish(),
  dateOfBirth:    z.string().datetime({ offset: true }).nullish(),
  dobDay:         z.string().nullish(),
  dobMonth:       z.string().nullish(),
  dobYear:        z.string().nullish(),
  gender:         genderSchema,
  bloodGroup:     bloodGroupSchema,
  state:          optionalString,
  stateOfDomicile: optionalString,
  nationality:    optionalString,
  category:       casteCategorySchema,
  casteCategory:  casteCategorySchema,
  profilePhoto:   optionalUrl,

  // ── 2. Contact Details ────────────────────────────────────────────────────
  email:             optionalEmail,
  studentEmail:      optionalEmail,
  callingMobile:     indianMobile,
  callingNumber:     indianMobile,
  whatsappMobile:    indianMobile,
  whatsappNumber:    indianMobile,
  alternativeMobile: indianMobile,
  altNumber:         indianMobile,

  // Parent — father
  fatherFirstName:   optionalString,
  fatherMiddleName:  optionalString,
  fatherLastName:    optionalString,
  fatherName:        optionalString,
  fatherDeceased:    z.boolean().optional(),
  fatherMobile:      indianMobile,
  fatherEmail:       optionalEmail,
  fatherOccupation:  optionalString,

  // Parent — mother
  motherFirstName:   optionalString,
  motherMiddleName:  optionalString,
  motherLastName:    optionalString,
  motherName:        optionalString,
  motherDeceased:    z.boolean().optional(),
  motherMobile:      indianMobile,
  motherEmail:       optionalEmail,
  motherOccupation:  optionalString,

  // Legacy guardian
  guardianName:      optionalString,
  guardianPhone:     indianMobile,
  guardianRelation:  optionalString,

  // ── 3. Address ────────────────────────────────────────────────────────────
  currentHouse:    optionalString,
  currentCross:    optionalString,
  currentArea:     optionalString,
  currentDistrict: optionalString,
  currentCity:     optionalString,
  currentState:    optionalString,
  currentPincode:  z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  currentAddress:  optionalString,

  sameAsCurrent:      z.boolean().optional(),
  permanentHouse:     optionalString,
  permanentCross:     optionalString,
  permanentArea:      optionalString,
  permanentDistrict:  optionalString,
  permanentCity:      optionalString,
  permanentState:     optionalString,
  permanentPincode:   z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  permanentAddress:   optionalString,

  country: optionalString,

  // ── 4. Academic — 10th ────────────────────────────────────────────────────
  tenthSchool:           optionalString,
  tenthSchoolName:       optionalString,
  tenthArea:             optionalString,
  tenthDistrict:         optionalString,
  tenthCity:             optionalString,
  tenthAreaDistrictCity: optionalString,
  tenthPincode:          z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  tenthState:            optionalString,
  tenthBoard:            boardSchema,
  tenthPassingYear:      z.number().int().min(1990).max(new Date().getFullYear() + 1).nullish(),
  tenthPassingMonth:     optionalString,
  tenthMarksType:        marksTypeSchema,
  tenthPercentage:       percentage,
  tenthSubjects:         z.number().int().min(1).max(20).nullish(),
  tenthTotalMarks:       z.number().int().min(0).nullish(),
  tenthMarksOutOf1000:   z.number().int().min(0).max(1000).nullish(),
  tenthMarksCard:        optionalUrl,

  // Academic level
  academicLevel: z.enum(["12th", "Diploma"]).nullish(),

  // ── 4. Academic — 12th ────────────────────────────────────────────────────
  hasCompletedTwelfth:     z.boolean().optional(),
  twelfthSchool:           optionalString,
  twelfthSchoolName:       optionalString,
  twelfthArea:             optionalString,
  twelfthDistrict:         optionalString,
  twelfthCity:             optionalString,
  twelfthAreaDistrictCity: optionalString,
  twelfthPincode:          z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  twelfthState:            optionalString,
  twelfthBoard:            boardSchema,
  twelfthPassingYear:      z.number().int().min(1990).max(new Date().getFullYear() + 1).nullish(),
  twelfthPassingMonth:     optionalString,
  twelfthMarksType:        marksTypeSchema,
  twelfthPercentage:       percentage,
  twelfthSubjects:         z.number().int().min(1).max(20).nullish(),
  twelfthTotalMarks:       z.number().int().min(0).nullish(),
  twelfthMarksOutOf1000:   z.number().int().min(0).max(1000).nullish(),
  twelfthMarksCard:        optionalUrl,
  twelfthCbseSubjects:     optionalString,
  twelfthCbseMarks:        optionalString,
  twelfthIcseMarks:        optionalString,

  // ── 4. Academic — Diploma ─────────────────────────────────────────────────
  hasCompletedDiploma:  z.boolean().optional(),
  diplomaCollege:       optionalString,
  diplomaCollegeName:   optionalString,
  diplomaArea:          optionalString,
  diplomaDistrict:      optionalString,
  diplomaCity:          optionalString,
  diplomaAreaLocation:  optionalString,
  diplomaCertificate:   optionalUrl,
  diplomaCertificates:  optionalUrl,
  diplomaSemesterSgpa:  z.unknown().optional(),
  diplomaSemesters:     z.unknown().optional(),
  diplomaYearMarks:     z.unknown().optional(),
  diplomaFirstYear:     optionalString,
  diplomaSecondYear:    optionalString,
  diplomaThirdYear:     optionalString,
  diplomaPercentage:    percentage,

  // ── 5. Engineering Details ────────────────────────────────────────────────
  collegeName:      optionalString,
  collegeDistrict:  optionalString,
  district:         optionalString,
  collegePincode:   z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  pincode:          z.string().regex(/^\d{6}$/, "Must be 6 digits").nullish(),
  branch:           branchSchema,
  entryType:        entryTypeSchema,
  seatCategory:     seatCategorySchema,
  usn:              usnSchema,
  libraryId:        optionalString,
  residencyStatus:  residencySchema,

  // Hostel
  hostelName:  optionalString,
  hostelRoom:  optionalString,
  roomNumber:  optionalString,
  hostelFloor: optionalString,
  floorNumber: optionalString,

  // Local
  city:          optionalString,
  localCity:     optionalString,
  transportMode: transportSchema,
  busRoute:      optionalString,

  batch:        optionalString,
  branchMentor: optionalString,

  // ── 6. Engineering Academics ─────────────────────────────────────────────
  semesters:          z.unknown().optional(),
  semesterRecords:    z.unknown().optional(),
  semesterMarksCards: z.unknown().optional(),
  failedSubjects:     z.unknown().optional(),
  clearedAfterFailure: z.unknown().optional(),

  // ── 7. KYC / Final Details ────────────────────────────────────────────────
  finalCgpa:     gpa,
  hasBacklogs:   z.enum(["yes", "no"]).nullish(),
  activeBacklogs: z.boolean().optional(),
  backlogs:       z.unknown().optional(),
  backlogSubjects: z.unknown().optional(),

  // ── Social Links ──────────────────────────────────────────────────────────
  linkedinLink: optionalUrl,
  githubLink:   optionalUrl,
  leetcodeLink: optionalUrl,
  linkedin:     optionalUrl,
  github:       optionalUrl,
  leetcode:     optionalUrl,
  portfolio:    optionalUrl,
  codechef:     optionalUrl,
  codeforces:   optionalUrl,
  hackerrank:   optionalUrl,

  // ── Documents ─────────────────────────────────────────────────────────────
  resumeUpload: optionalUrl,
  resume:       optionalUrl,

  // ── Professional ─────────────────────────────────────────────────────────
  skills:         z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  projects:       z.unknown().optional(),
  internships:    z.unknown().optional(),
  achievements:   z.array(z.string()).optional(),
  hobbies:        z.array(z.string()).optional(),
  languages:      z.array(z.string()).optional(),

  // ── Placement Preferences ─────────────────────────────────────────────────
  expectedSalary:     z.number().positive("Must be positive").nullish(),
  preferredLocations: z.array(z.string()).optional(),
  jobType:            jobTypeSchema,
  workMode:           workModeSchema,

  // ── Compatibility / legacy ────────────────────────────────────────────────
  phone:          indianMobile,
  alternatePhone: indianMobile,
  course:         optionalString,
  specialization: optionalString,
  semester:       z.number().int().min(1).max(8).nullish(),
  year:           z.number().int().min(1).max(4).nullish(),
  cgpa:           gpa,
  percentage:     percentage,
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// ─── GET response shape (subset returned to client) ──────────────────────────
// Admin-sensitive fields (verifiedBy) are omitted at the API layer.
export type ProfileResponse = ProfileUpdateInput & {
  id: string
  userId: string
  kycStatus: string
  isComplete: boolean
  completionStep: number
  createdAt: string
  updatedAt: string
}
