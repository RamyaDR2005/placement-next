export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export const STATES = [
  "KARNATAKA", "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR",
  "CHHATTISGARH", "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH",
  "JHARKHAND", "KERALA", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR",
  "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUNJAB", "RAJASTHAN",
  "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", "UTTAR PRADESH",
  "UTTARAKHAND", "WEST BENGAL",
]

export function generateYears(): string[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 45 }, (_, i) => (current - i).toString())
}

export type AcademicFormData = {
  // 10th
  tenthSchool: string
  tenthArea: string
  tenthDistrict: string
  tenthCity: string
  tenthPincode: string
  tenthState: string
  tenthBoard: string
  tenthPassingYear: string
  tenthPassingMonth: string
  tenthPercentage: string
  tenthMarksCard: File | string | null
  // Level
  academicLevel: string
  // 12th
  twelfthSchool: string
  twelfthArea: string
  twelfthDistrict: string
  twelfthCity: string
  twelfthPincode: string
  twelfthState: string
  twelfthBoard: string
  twelfthPassingYear: string
  twelfthPassingMonth: string
  twelfthPercentage: string
  twelfthMarksCard: File | string | null
  twelfthCbseSubjects: string
  twelfthCbseMarks: string
  twelfthIcseMarks: string
  // Diploma
  diplomaCollege: string
  diplomaArea: string
  diplomaDistrict: string
  diplomaCity: string
  diplomaPincode: string
  diplomaState: string
  diplomaPercentage: string
  diplomaCertificates: File | string | null
  diplomaSemesters: Array<{ semester: number; sgpa: string; cgpa: string; marks: string }>
  diplomaFirstYear: string
  diplomaSecondYear: string
  diplomaThirdYear: string
}

export const INITIAL_FORM_DATA = (init: Partial<AcademicFormData> = {}): AcademicFormData => ({
  tenthSchool: init.tenthSchool ?? "",
  tenthArea: init.tenthArea ?? "",
  tenthDistrict: init.tenthDistrict ?? "",
  tenthCity: init.tenthCity ?? "",
  tenthPincode: init.tenthPincode ?? "",
  tenthState: init.tenthState ?? "KARNATAKA",
  tenthBoard: init.tenthBoard ?? "",
  tenthPassingYear: init.tenthPassingYear ?? "",
  tenthPassingMonth: init.tenthPassingMonth ?? "",
  tenthPercentage: init.tenthPercentage ?? "",
  tenthMarksCard: init.tenthMarksCard ?? null,
  academicLevel: init.academicLevel ?? "",
  twelfthSchool: init.twelfthSchool ?? "",
  twelfthArea: init.twelfthArea ?? "",
  twelfthDistrict: init.twelfthDistrict ?? "",
  twelfthCity: init.twelfthCity ?? "",
  twelfthPincode: init.twelfthPincode ?? "",
  twelfthState: init.twelfthState ?? "KARNATAKA",
  twelfthBoard: init.twelfthBoard ?? "",
  twelfthPassingYear: init.twelfthPassingYear ?? "",
  twelfthPassingMonth: init.twelfthPassingMonth ?? "",
  twelfthPercentage: init.twelfthPercentage ?? "",
  twelfthMarksCard: init.twelfthMarksCard ?? null,
  twelfthCbseSubjects: init.twelfthCbseSubjects ?? "5",
  twelfthCbseMarks: init.twelfthCbseMarks ?? "",
  twelfthIcseMarks: init.twelfthIcseMarks ?? "",
  diplomaCollege: init.diplomaCollege ?? "",
  diplomaArea: init.diplomaArea ?? "",
  diplomaDistrict: init.diplomaDistrict ?? "",
  diplomaCity: init.diplomaCity ?? "",
  diplomaPincode: init.diplomaPincode ?? "",
  diplomaState: init.diplomaState ?? "KARNATAKA",
  diplomaPercentage: init.diplomaPercentage ?? "",
  diplomaCertificates: init.diplomaCertificates ?? null,
  diplomaSemesters: init.diplomaSemesters ?? Array.from({ length: 6 }, (_, i) => ({
    semester: i + 1, sgpa: "", cgpa: "", marks: "",
  })),
  diplomaFirstYear: init.diplomaFirstYear ?? "",
  diplomaSecondYear: init.diplomaSecondYear ?? "",
  diplomaThirdYear: init.diplomaThirdYear ?? "",
})
