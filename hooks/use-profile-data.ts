"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type {
  PersonalInfo,
  ContactAndParentDetails,
  AddressDetails,
  TenthStandardDetails,
  TwelfthDiplomaDetails,
  EngineeringDetails,
  EngineeringAcademicDetails,
} from "@/types/profile"

export type ProfileData = {
  personalInfo?: Partial<PersonalInfo>
  contactDetails?: Partial<ContactAndParentDetails>
  addressDetails?: Partial<AddressDetails>
  tenthDetails?: Partial<TenthStandardDetails>
  twelfthDiplomaDetails?: Partial<TwelfthDiplomaDetails>
  engineeringDetails?: Partial<EngineeringDetails>
  engineeringAcademicDetails?: Partial<EngineeringAcademicDetails>
  completionStep?: number
  isComplete?: boolean
  [key: string]: unknown
}

type UseProfileDataReturn = {
  profile: ProfileData
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>
  isLoading: boolean
  initialDataLoaded: boolean
  fetchProfile: () => Promise<number>
  saveStep: (currentStep: number, stepData: unknown) => Promise<boolean>
}

export function useProfileData(): UseProfileDataReturn {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  const fetchProfile = async (): Promise<number> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed to fetch profile")
      const { profile: p } = await res.json()
      if (!p) return 1

      const structured: ProfileData = {
        personalInfo: {
          firstName: p.firstName,
          middleName: p.middleName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          stateOfDomicile: p.stateOfDomicile,
          nationality: p.nationality,
          casteCategory: p.casteCategory,
          profilePhoto: p.profilePhoto,
        },
        contactDetails: {
          email: p.email,
          callingMobile: p.callingMobile,
          whatsappMobile: p.whatsappMobile,
          alternativeMobile: p.alternativeMobile,
          fatherName: p.fatherName,
          fatherMobile: p.fatherMobile,
          fatherEmail: p.fatherEmail,
          fatherOccupation: p.fatherOccupation,
          fatherDeceased: p.fatherDeceased,
          motherName: p.motherName,
          motherMobile: p.motherMobile,
          motherEmail: p.motherEmail,
          motherOccupation: p.motherOccupation,
          motherDeceased: p.motherDeceased,
        },
        addressDetails: {
          currentHouse: p.currentHouse,
          currentCross: p.currentCross,
          currentArea: p.currentArea,
          currentDistrict: p.currentDistrict,
          currentCity: p.currentCity,
          currentPincode: p.currentPincode,
          currentState: p.currentState,
          currentAddress: p.currentAddress,
          permanentHouse: p.permanentHouse,
          permanentCross: p.permanentCross,
          permanentArea: p.permanentArea,
          permanentDistrict: p.permanentDistrict,
          permanentCity: p.permanentCity,
          permanentPincode: p.permanentPincode,
          permanentState: p.permanentState,
          permanentAddress: p.permanentAddress,
          sameAsCurrent: p.sameAsCurrent,
          country: p.country || "INDIA",
        },
        tenthDetails: {
          tenthSchoolName: p.tenthSchoolName,
          tenthAreaDistrictCity: p.tenthAreaDistrictCity,
          tenthPincode: p.tenthPincode,
          tenthState: p.tenthState,
          tenthBoard: p.tenthBoard,
          tenthPassingYear: p.tenthPassingYear,
          tenthPassingMonth: p.tenthPassingMonth,
          tenthPercentage: p.tenthPercentage,
          tenthMarksCard: p.tenthMarksCard,
        },
        twelfthDiplomaDetails: {
          twelfthOrDiploma: p.twelfthOrDiploma,
          twelfthSchoolName: p.twelfthSchoolName,
          twelfthArea: p.twelfthArea,
          twelfthDistrict: p.twelfthDistrict,
          twelfthCity: p.twelfthCity,
          twelfthPincode: p.twelfthPincode,
          twelfthState: p.twelfthState,
          twelfthBoard: p.twelfthBoard,
          twelfthPassingYear: p.twelfthPassingYear,
          twelfthPassingMonth: p.twelfthPassingMonth,
          twelfthStatePercentage: p.twelfthStatePercentage,
          twelfthCbseSubjects: p.twelfthCbseSubjects,
          twelfthCbseMarks: p.twelfthCbseMarks,
          twelfthIcseMarks: p.twelfthIcseMarks,
          twelfthMarkcard: p.twelfthMarkcard,
          diplomaCollege: p.diplomaCollege,
          diplomaArea: p.diplomaArea,
          diplomaDistrict: p.diplomaDistrict,
          diplomaCity: p.diplomaCity,
          diplomaPincode: p.diplomaPincode,
          diplomaState: p.diplomaState,
          diplomaPercentage: p.diplomaPercentage,
          diplomaCertificates: p.diplomaCertificates,
        },
        engineeringDetails: {
          collegeName: p.collegeName,
          city: p.city,
          district: p.district,
          pincode: p.pincode,
          branch: p.branch,
          entryType: p.entryType,
          seatCategory: p.seatCategory,
          usn: p.usn,
          libraryId: p.libraryId,
          residencyStatus: p.residencyStatus,
          hostelName: p.hostelName,
          roomNumber: p.hostelRoom,
          floorNumber: p.hostelFloor,
          localCity: p.localCity,
          transportMode: p.transportMode,
          busRoute: p.busRoute,
          branchMentorName: p.branchMentor,
          linkedin: p.linkedinLink,
          github: p.githubLink,
          leetcode: p.leetcodeLink,
          resume: p.resumeUpload,
        },
        engineeringAcademicDetails: {
          finalCgpa: p.finalCgpa,
          activeBacklogs: p.activeBacklogs,
          backlogSubjects: p.backlogs,
        },
        completionStep: p.completionStep,
        isComplete: p.isComplete,
      }

      setProfile(structured)
      return p.completionStep || 1
    } catch {
      toast.error("Failed to load profile data")
      return 1
    } finally {
      setIsLoading(false)
      setInitialDataLoaded(true)
    }
  }

  const saveStep = async (currentStep: number, stepData: unknown): Promise<boolean> => {
    const sd = stepData as Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let flat: Record<string, any> = { completionStep: currentStep + 1 }

    switch (currentStep) {
      case 1: {
        const p = sd.personalInfo as Record<string, unknown>
        flat = {
          ...flat,
          firstName: p?.firstName,
          middleName: p?.middleName,
          lastName: p?.lastName,
          dateOfBirth: p?.dateOfBirth,
          gender: p?.gender,
          bloodGroup: p?.bloodGroup,
          stateOfDomicile: p?.stateOfDomicile,
          nationality: p?.nationality,
          casteCategory: p?.casteCategory,
          profilePhoto: p?.profilePhoto,
        }
        break
      }
      case 2: {
        const c = sd.contactDetails as Record<string, unknown>
        const a = sd.addressDetails as Record<string, unknown>
        flat = {
          ...flat,
          email: c?.email,
          callingMobile: c?.callingMobile,
          whatsappMobile: c?.whatsappMobile,
          alternativeMobile: c?.alternativeMobile,
          fatherName: c?.fatherName,
          fatherMobile: c?.fatherMobile,
          fatherEmail: c?.fatherEmail,
          fatherOccupation: c?.fatherOccupation,
          fatherDeceased: c?.fatherDeceased,
          motherName: c?.motherName,
          motherMobile: c?.motherMobile,
          motherEmail: c?.motherEmail,
          motherOccupation: c?.motherOccupation,
          motherDeceased: c?.motherDeceased,
          currentHouse: a?.currentHouse,
          currentCross: a?.currentCross,
          currentArea: a?.currentArea,
          currentDistrict: a?.currentDistrict,
          currentCity: a?.currentCity,
          currentPincode: a?.currentPincode,
          currentState: a?.currentState,
          currentAddress: a?.currentAddress,
          sameAsCurrent: a?.sameAsCurrent,
          permanentHouse: a?.permanentHouse,
          permanentCross: a?.permanentCross,
          permanentArea: a?.permanentArea,
          permanentDistrict: a?.permanentDistrict,
          permanentCity: a?.permanentCity,
          permanentPincode: a?.permanentPincode,
          permanentState: a?.permanentState,
          permanentAddress: a?.permanentAddress,
          country: a?.country,
        }
        break
      }
      case 3: {
        const t = sd.tenthDetails as Record<string, unknown>
        const tw = sd.twelfthDiplomaDetails as Record<string, unknown>
        flat = {
          ...flat,
          tenthSchoolName: t?.tenthSchoolName,
          tenthAreaDistrictCity: t?.tenthAreaDistrictCity,
          tenthPincode: t?.tenthPincode,
          tenthState: t?.tenthState,
          tenthBoard: t?.tenthBoard,
          tenthPassingYear: t?.tenthPassingYear,
          tenthPassingMonth: t?.tenthPassingMonth,
          tenthPercentage: t?.tenthPercentage,
          tenthMarksCard: t?.tenthMarksCard,
          twelfthSchoolName: tw?.twelfthSchoolName,
          twelfthArea: tw?.twelfthArea,
          twelfthDistrict: tw?.twelfthDistrict,
          twelfthCity: tw?.twelfthCity,
          twelfthPincode: tw?.twelfthPincode,
          twelfthState: tw?.twelfthState,
          twelfthBoard: tw?.twelfthBoard,
          twelfthPassingYear: tw?.twelfthPassingYear,
          twelfthPassingMonth: tw?.twelfthPassingMonth,
          twelfthPercentage: tw?.twelfthStatePercentage,
          twelfthCbseSubjects: tw?.twelfthCbseSubjects,
          twelfthCbseMarks: tw?.twelfthCbseMarks,
          twelfthIcseMarks: tw?.twelfthIcseMarks,
          twelfthMarksCard: tw?.twelfthMarkcard,
          diplomaCollege: tw?.diplomaCollege,
          diplomaArea: tw?.diplomaArea,
          diplomaDistrict: tw?.diplomaDistrict,
          diplomaCity: tw?.diplomaCity,
          diplomaPercentage: tw?.diplomaPercentage,
          diplomaCertificates: tw?.diplomaCertificates,
        }
        break
      }
      case 4: {
        const e = sd.engineeringDetails as Record<string, unknown>
        const ea = sd.engineeringAcademicDetails as Record<string, unknown>
        flat = {
          ...flat,
          collegeName: e?.collegeName,
          city: e?.city,
          district: e?.district,
          pincode: e?.pincode,
          branch: e?.branch,
          entryType: e?.entryType,
          seatCategory: e?.seatCategory,
          usn: e?.usn,
          libraryId: e?.libraryId,
          residencyStatus: e?.residencyStatus,
          hostelName: e?.hostelName,
          hostelRoom: e?.roomNumber,
          hostelFloor: e?.floorNumber,
          localCity: e?.localCity,
          transportMode: e?.transportMode,
          busRoute: e?.busRoute,
          branchMentor: e?.branchMentorName,
          linkedinLink: e?.linkedin,
          githubLink: e?.github,
          leetcodeLink: e?.leetcode,
          resumeUpload: e?.resume,
          finalCgpa: ea?.finalCgpa,
          activeBacklogs: ea?.activeBacklogs,
          backlogs: ea?.backlogSubjects,
        }
        break
      }
      case 5:
        flat.isComplete = true
        break
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flat),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile((prev) => ({ ...prev, ...data.profile }))
        toast.success("Progress saved")
        if (currentStep === 5) {
          sessionStorage.removeItem("profile-current-step")
          toast.success("Profile complete! Redirecting…")
          setTimeout(() => router.push("/dashboard"), 1500)
        }
        return true
      }

      const err = await res.json()
      toast.error(err.error || "Failed to save")
      return false
    } catch {
      toast.error("Something went wrong. Please try again.")
      return false
    }
  }

  return { profile, setProfile, isLoading, initialDataLoaded, fetchProfile, saveStep }
}
