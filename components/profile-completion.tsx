"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { PersonalInfoStep } from "./steps/personal-info-step"
import { ContactDetailsStep } from "./steps/contact-details-step"
import { AcademicDetailsStep } from "./steps/academic-details-step"
import { EngineeringDetailsStep } from "./steps/engineering-details-step"
import { ReviewStep } from "./steps/review-step"
import { PageLoading } from "@/components/ui/loading"
import { SaveStatusIndicator } from "@/components/save-status-indicator"
import { useProfileForm } from "@/hooks/use-profile-form"
import { useProfileData } from "@/hooks/use-profile-data"

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Academic" },
  { id: 4, label: "Engineering" },
  { id: 5, label: "Review" },
]

export function ProfileCompletion() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("profile-current-step")
      return s ? parseInt(s, 10) : 1
    }
    return 1
  })
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const { profile, setProfile, isLoading, initialDataLoaded, fetchProfile, saveStep } = useProfileData()

  const { formData, saveState, isDirty, saveManually, setFormData } = useProfileForm({
    initialData: profile,
    onSaveSuccess: (data) => {
      if (data.profile) setProfile((prev) => ({ ...prev, ...data.profile }))
    },
    onSaveError: () => {},
    autoSaveDelay: 2000,
    enableLocalStorage: true,
    storageKey: `profile-form-step-${currentStep}`,
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (session?.user && !initialDataLoaded) {
      fetchProfile().then((savedStep) => {
        setCurrentStep(savedStep)
        sessionStorage.setItem("profile-current-step", savedStep.toString())
        setCompletedSteps(new Set(Array.from({ length: savedStep - 1 }, (_, i) => i + 1)))
      })
    }
  }, [session, initialDataLoaded, fetchProfile])

  useEffect(() => {
    if (initialDataLoaded && Object.keys(profile).length > 0) {
      setFormData(profile)
    }
  }, [initialDataLoaded, profile, setFormData])

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("profile-current-step", currentStep.toString())
    }
  }, [currentStep])

  const goTo = async (step: number) => {
    if (isDirty) {
      toast.info("Saving…")
      await saveManually()
    }
    setCurrentStep(step)
  }

  const handleNext = async (stepData: unknown) => {
    const sectionKey = ["personalInfo", "contact", "academic", "engineering", "review"][currentStep - 1]
    const structured = buildStructuredData(currentStep, stepData)
    const ok = await saveStep(currentStep, structured)
    if (!ok) return

    setCompletedSteps((prev) => new Set([...prev, currentStep]))
    if (currentStep < 5) setCurrentStep(currentStep + 1)
    // step 5 save navigates to /dashboard internally
    void sectionKey
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const currentData = { ...profile, ...formData }

  const renderStep = () => {
    switch (currentStep) {
      case 1: {
        const dob = currentData.personalInfo?.dateOfBirth
        return (
          <PersonalInfoStep
            initialData={{
              firstName: currentData.personalInfo?.firstName || "",
              middleName: currentData.personalInfo?.middleName || ".",
              lastName: currentData.personalInfo?.lastName || "",
              dateOfBirth: dob instanceof Date ? dob.toISOString() : (typeof dob === "string" ? dob : ""),
              gender: currentData.personalInfo?.gender === "MALE" ? "Male"
                : currentData.personalInfo?.gender === "FEMALE" ? "Female"
                : (currentData.personalInfo?.gender as string) || "",
              bloodGroup: (currentData.personalInfo?.bloodGroup as string) || "",
              state: (currentData.personalInfo?.stateOfDomicile as string) || "KARNATAKA",
              nationality: (currentData.personalInfo?.nationality as string) || "Indian",
              category: (currentData.personalInfo?.casteCategory as string) || "",
              profilePhoto: (currentData.personalInfo?.profilePhoto as string) || null,
            }}
            onNext={handleNext}
          />
        )
      }
      case 2: {
        const c = currentData.contactDetails || {}
        const a = currentData.addressDetails || {}
        const splitName = (name: string | undefined) => {
          const parts = (name || "").split(" ")
          return { first: parts[0] || "", mid: parts[1] || ".", last: parts.slice(2).join(" ") || "" }
        }
        const father = splitName(c.fatherName as string)
        const mother = splitName(c.motherName as string)
        return (
          <ContactDetailsStep
            initialData={{
              studentEmail: (c.email as string) || "",
              callingNumber: (c.callingMobile as string) || "",
              whatsappNumber: (c.whatsappMobile as string) || "",
              altNumber: (c.alternativeMobile as string) || "",
              fatherFirstName: father.first,
              fatherMiddleName: father.mid,
              fatherLastName: father.last,
              fatherDeceased: (c.fatherDeceased as boolean) || false,
              fatherMobile: (c.fatherMobile as string) || "",
              fatherEmail: (c.fatherEmail as string) || "",
              fatherOccupation: (c.fatherOccupation as string) || "",
              motherFirstName: mother.first,
              motherMiddleName: mother.mid,
              motherLastName: mother.last,
              motherDeceased: (c.motherDeceased as boolean) || false,
              motherMobile: (c.motherMobile as string) || "",
              motherEmail: (c.motherEmail as string) || "",
              motherOccupation: (c.motherOccupation as string) || "",
              currentHouse: (a.currentHouse as string) || "",
              currentCross: (a.currentCross as string) || "",
              currentArea: (a.currentArea as string) || "",
              currentDistrict: (a.currentDistrict as string) || "",
              currentCity: (a.currentCity as string) || "",
              currentPincode: (a.currentPincode as string) || "",
              currentState: (a.currentState as string) || "KARNATAKA",
              sameAsCurrent: (a.sameAsCurrent as boolean) || false,
              permanentHouse: (a.permanentHouse as string) || "",
              permanentCross: (a.permanentCross as string) || "",
              permanentArea: (a.permanentArea as string) || "",
              permanentDistrict: (a.permanentDistrict as string) || "",
              permanentCity: (a.permanentCity as string) || "",
              permanentPincode: (a.permanentPincode as string) || "",
              permanentState: (a.permanentState as string) || "KARNATAKA",
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      }
      case 3: {
        const t = currentData.tenthDetails || {}
        const tw = currentData.twelfthDiplomaDetails || {}
        return (
          <AcademicDetailsStep
            initialData={{
              tenthSchool: (t.tenthSchoolName as string) || "",
              tenthArea: (t.tenthAreaDistrictCity as string) || "",
              tenthDistrict: (t.tenthDistrict as string) || "",
              tenthCity: (t.tenthCity as string) || "",
              tenthPincode: (t.tenthPincode as string) || "",
              tenthState: (t.tenthState as string) || "KARNATAKA",
              tenthBoard: (t.tenthBoard as string) || "",
              tenthPassingYear: t.tenthPassingYear?.toString() || "",
              tenthPassingMonth: (t.tenthPassingMonth as string) || "",
              tenthPercentage: t.tenthPercentage?.toString() || "",
              tenthMarksCard: (t.tenthMarksCard as string) || null,
              academicLevel: tw.twelfthOrDiploma === "12th" ? "12th"
                : tw.twelfthOrDiploma === "Diploma" ? "Diploma" : "",
              twelfthSchool: (tw.twelfthSchoolName as string) || "",
              twelfthArea: (tw.twelfthArea as string) || "",
              twelfthDistrict: (tw.twelfthDistrict as string) || "",
              twelfthCity: (tw.twelfthCity as string) || "",
              twelfthPincode: (tw.twelfthPincode as string) || "",
              twelfthState: (tw.twelfthState as string) || "KARNATAKA",
              twelfthBoard: (tw.twelfthBoard as string) || "",
              twelfthPassingYear: tw.twelfthPassingYear?.toString() || "",
              twelfthPassingMonth: (tw.twelfthPassingMonth as string) || "",
              twelfthPercentage: tw.twelfthPercentage?.toString() || "",
              twelfthMarksCard: (tw.twelfthMarkcard as string) || null,
              twelfthCbseSubjects: (tw.twelfthCbseSubjects as string) || "5",
              twelfthCbseMarks: (tw.twelfthCbseMarks as string) || "",
              twelfthIcseMarks: (tw.twelfthIcseMarks as string) || "",
              diplomaCollege: (tw.diplomaCollege as string) || "",
              diplomaArea: (tw.diplomaArea as string) || "",
              diplomaDistrict: (tw.diplomaDistrict as string) || "",
              diplomaCity: (tw.diplomaCity as string) || "",
              diplomaPincode: (tw.diplomaPincode as string) || "",
              diplomaState: (tw.diplomaState as string) || "KARNATAKA",
              diplomaPercentage: tw.diplomaPercentage?.toString() || "",
              diplomaCertificates: (tw.diplomaCertificates as string) || null,
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      }
      case 4: {
        const e = currentData.engineeringDetails || {}
        const ea = currentData.engineeringAcademicDetails || {}
        const branchMap: Record<string, string> = {
          CSE: "CS", ISE: "IS", ECE: "EC", EEE: "EE", ME: "ME", CE: "CV", AIML: "AI", DS: "IS",
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const engInitialData: any = {
          collegeName: (e.collegeName as string) || "SHRI DHARMASTHALA MANJUNATHESHWARA COLLEGE OF ENGINEERING AND TECHNOLOGY",
          district: (e.district as string) || "DHARWAD",
          pincode: (e.pincode as string) || "580002",
          branch: branchMap[e.branch as string] || (e.branch as string) || "",
          entryType: e.entryType === "REGULAR" ? "regular" : e.entryType === "LATERAL" ? "lateral" : "",
          seatCategory: (e.seatCategory as string) || "",
          usn: (e.usn as string) || "",
          libraryId: (e.libraryId as string) || "",
          residencyStatus: e.residencyStatus === "HOSTELITE" ? "hostelite" : e.residencyStatus === "LOCALITE" ? "localite" : "",
          hostelName: (e.hostelName as string) || "",
          hostelRoom: (e.roomNumber as string) || "",
          hostelFloor: (e.floorNumber as string) || "",
          city: (e.localCity as string) || "",
          transportMode: e.transportMode === "COLLEGE_BUS" ? "college_bus" : e.transportMode === "PRIVATE_TRANSPORT" ? "own_vehicle" : "",
          busRoute: (e.busRoute as string) || "",
          batch: "2022 - 2026",
          branchMentor: (e.branchMentorName as string) || "",
          linkedinLink: (e.linkedin as string) || "",
          githubLink: (e.github as string) || "",
          leetcodeLink: (e.leetcode as string) || "",
          resumeUpload: null,
          semesters: (() => {
            const raw = ea.semesters
            if (!raw) return Array.from({ length: 6 }, (_, i) => ({ semester: i + 1, sgpa: "", cgpa: "", monthPassed: "", yearPassed: "", marksCard: null, failed: false, failedSubjects: [] }))
            return Array.isArray(raw) ? raw : JSON.parse(raw as string)
          })(),
          finalCgpa: ea.finalCgpa?.toString() || "",
          hasBacklogs: ea.activeBacklogs ? "yes" : "no",
          backlogs: (() => {
            const raw = ea.backlogSubjects
            if (!raw) return []
            return Array.isArray(raw) ? raw : JSON.parse(raw as string)
          })(),
        }
        return (
          <EngineeringDetailsStep
            initialData={engInitialData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      }
      case 5:
        return <ReviewStep formData={currentData} onPrevious={handlePrevious} />
      default:
        return null
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageLoading message="Loading your profile…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-base font-semibold tracking-tight">Complete Your Profile</h1>
              <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">
                SDMCET Placement Portal — {5 - currentStep + 1} step{5 - currentStep + 1 !== 1 ? "s" : ""} remaining
              </p>
            </div>
            <SaveStatusIndicator
              status={saveState.status}
              lastSaved={saveState.lastSaved}
              onRetry={saveManually}
              showText
            />
          </div>

          {/* Horizontal stepper */}
          <div className="flex items-center gap-0 pb-4 overflow-x-auto">
            {STEPS.map((step, idx) => {
              const isDone = completedSteps.has(step.id)
              const isActive = currentStep === step.id
              const isClickable = isDone || step.id <= Math.max(...Array.from(completedSteps), 1)

              return (
                <div key={step.id} className="flex items-center min-w-0">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && goTo(step.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-neutral-900 text-white"
                        : isDone
                          ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          : "text-neutral-400 cursor-default"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold shrink-0",
                      isActive ? "bg-white/20" : isDone ? "bg-neutral-300" : "bg-neutral-200"
                    )}>
                      {isDone && !isActive ? <Check className="w-2.5 h-2.5" /> : step.id}
                    </span>
                    {step.label}
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={cn(
                      "h-px w-4 shrink-0 mx-0.5",
                      completedSteps.has(step.id) ? "bg-neutral-300" : "bg-neutral-200"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 lg:py-8">
        {/* Step label */}
        <div className="mb-6">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Step {currentStep} of {STEPS.length}
          </p>
          <h2 className="text-lg font-semibold tracking-tight mt-0.5">
            {STEPS[currentStep - 1]?.label}
          </h2>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}

// ─── Data structuring helpers ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildStructuredData(step: number, raw: any) {
  switch (step) {
    case 1:
      return {
        personalInfo: {
          firstName: raw.firstName,
          middleName: raw.middleName,
          lastName: raw.lastName,
          dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : undefined,
          gender: raw.gender === "Male" ? "MALE" : raw.gender === "Female" ? "FEMALE" : raw.gender,
          bloodGroup: raw.bloodGroup,
          stateOfDomicile: raw.state,
          nationality: raw.nationality || "INDIAN",
          casteCategory: raw.category,
          profilePhoto: raw.profilePhoto,
        },
      }
    case 2:
      return {
        contactDetails: {
          email: raw.studentEmail,
          callingMobile: raw.callingNumber,
          whatsappMobile: raw.whatsappNumber,
          alternativeMobile: raw.altNumber,
          fatherName: [raw.fatherFirstName, raw.fatherMiddleName, raw.fatherLastName].filter(Boolean).join(" "),
          fatherMobile: raw.fatherMobile,
          fatherEmail: raw.fatherEmail,
          fatherOccupation: raw.fatherOccupation,
          fatherDeceased: raw.fatherDeceased,
          motherName: [raw.motherFirstName, raw.motherMiddleName, raw.motherLastName].filter(Boolean).join(" "),
          motherMobile: raw.motherMobile,
          motherEmail: raw.motherEmail,
          motherOccupation: raw.motherOccupation,
          motherDeceased: raw.motherDeceased,
        },
        addressDetails: {
          currentHouse: raw.currentHouse,
          currentCross: raw.currentCross,
          currentArea: raw.currentArea,
          currentDistrict: raw.currentDistrict,
          currentCity: raw.currentCity,
          currentPincode: raw.currentPincode,
          currentState: raw.currentState,
          currentAddress: [raw.currentHouse, raw.currentArea, raw.currentCity, raw.currentState].filter(Boolean).join(", "),
          sameAsCurrent: raw.sameAsCurrent,
          permanentHouse: raw.sameAsCurrent ? raw.currentHouse : raw.permanentHouse,
          permanentCross: raw.sameAsCurrent ? raw.currentCross : raw.permanentCross,
          permanentArea: raw.sameAsCurrent ? raw.currentArea : raw.permanentArea,
          permanentDistrict: raw.sameAsCurrent ? raw.currentDistrict : raw.permanentDistrict,
          permanentCity: raw.sameAsCurrent ? raw.currentCity : raw.permanentCity,
          permanentPincode: raw.sameAsCurrent ? raw.currentPincode : raw.permanentPincode,
          permanentState: raw.sameAsCurrent ? raw.currentState : raw.permanentState,
          permanentAddress: raw.sameAsCurrent
            ? [raw.currentHouse, raw.currentArea, raw.currentCity, raw.currentState].filter(Boolean).join(", ")
            : [raw.permanentHouse, raw.permanentArea, raw.permanentCity, raw.permanentState].filter(Boolean).join(", "),
          country: "INDIA",
        },
      }
    case 3:
      return {
        tenthDetails: {
          tenthSchoolName: raw.tenthSchool,
          tenthAreaDistrictCity: [raw.tenthArea, raw.tenthDistrict, raw.tenthCity].filter(Boolean).join(", "),
          tenthPincode: raw.tenthPincode,
          tenthState: raw.tenthState,
          tenthBoard: raw.tenthBoard,
          tenthPassingYear: parseInt(raw.tenthPassingYear),
          tenthPassingMonth: raw.tenthPassingMonth,
          tenthPercentage: parseFloat(raw.tenthPercentage),
          tenthMarksCard: raw.tenthMarksCard,
        },
        twelfthDiplomaDetails: raw.academicLevel === "12th" ? {
          twelfthOrDiploma: "12th",
          twelfthSchoolName: raw.twelfthSchool,
          twelfthArea: raw.twelfthArea,
          twelfthDistrict: raw.twelfthDistrict,
          twelfthCity: raw.twelfthCity,
          twelfthPincode: raw.twelfthPincode,
          twelfthState: raw.twelfthState,
          twelfthBoard: raw.twelfthBoard,
          twelfthPassingYear: parseInt(raw.twelfthPassingYear),
          twelfthPassingMonth: raw.twelfthPassingMonth,
          twelfthStatePercentage: parseFloat(raw.twelfthPercentage),
          twelfthCbseSubjects: raw.twelfthCbseSubjects,
          twelfthCbseMarks: raw.twelfthCbseMarks,
          twelfthIcseMarks: raw.twelfthIcseMarks,
          twelfthMarkcard: raw.twelfthMarksCard,
        } : {
          twelfthOrDiploma: "Diploma",
          diplomaCollege: raw.diplomaCollege,
          diplomaArea: raw.diplomaArea,
          diplomaDistrict: raw.diplomaDistrict,
          diplomaCity: raw.diplomaCity,
          diplomaPincode: raw.diplomaPincode,
          diplomaState: raw.diplomaState,
          diplomaPercentage: parseFloat(raw.diplomaPercentage),
          diplomaCertificates: raw.diplomaCertificates,
        },
      }
    case 4:
      return {
        engineeringDetails: {
          collegeName: raw.collegeName,
          city: raw.city,
          district: raw.district,
          pincode: raw.pincode,
          branch: raw.branch,
          entryType: raw.entryType === "regular" ? "REGULAR" : "LATERAL",
          seatCategory: raw.seatCategory,
          usn: raw.usn,
          libraryId: raw.libraryId,
          residencyStatus: raw.residencyStatus === "hostelite" ? "HOSTELITE" : "LOCALITE",
          hostelName: raw.hostelName,
          roomNumber: raw.hostelRoom,
          floorNumber: raw.hostelFloor,
          localCity: raw.city,
          transportMode: raw.transportMode === "college_bus" ? "COLLEGE_BUS" : "PRIVATE_TRANSPORT",
          busRoute: raw.busRoute,
          branchMentorName: raw.branchMentor,
          linkedin: raw.linkedinLink,
          github: raw.githubLink,
          leetcode: raw.leetcodeLink,
          resume: raw.resumeUpload,
        },
        engineeringAcademicDetails: {
          finalCgpa: parseFloat(raw.finalCgpa),
          activeBacklogs: raw.hasBacklogs === "yes",
          backlogSubjects: raw.backlogs || [],
        },
      }
    case 5:
      return { isComplete: true }
    default:
      return {}
  }
}
