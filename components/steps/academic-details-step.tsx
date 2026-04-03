"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

import { TenthForm } from "./academic/tenth-form"
import { TwelfthForm } from "./academic/twelfth-form"
import { DiplomaForm } from "./academic/diploma-form"
import { INITIAL_FORM_DATA, type AcademicFormData } from "./academic/shared"

interface AcademicDetailsStepProps {
  onNext: (data: AcademicFormData) => void
  onPrevious: () => void
  initialData?: Partial<AcademicFormData>
}

export function AcademicDetailsStep({ onNext, onPrevious, initialData = {} }: AcademicDetailsStepProps) {
  const [formData, setFormData] = useState<AcademicFormData>(() => INITIAL_FORM_DATA(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string | File | null) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }

      // Auto-calculate CBSE percentage
      if (field === "twelfthCbseMarks" || field === "twelfthCbseSubjects") {
        const marks = field === "twelfthCbseMarks" ? parseFloat(value as string) : parseFloat(prev.twelfthCbseMarks)
        const subjects = field === "twelfthCbseSubjects" ? (value as string) : prev.twelfthCbseSubjects
        const max = subjects === "5" ? 500 : 600
        next.twelfthPercentage = (!isNaN(marks) && marks >= 0 && marks <= max)
          ? ((marks / max) * 100).toFixed(2)
          : ""
      }

      // Auto-calculate ICSE percentage
      if (field === "twelfthIcseMarks") {
        const marks = parseFloat(value as string)
        next.twelfthPercentage = (!isNaN(marks) && marks >= 0 && marks <= 1000)
          ? ((marks / 1000) * 100).toFixed(2)
          : ""
      }

      // Clear board-specific fields on board change
      if (field === "twelfthBoard") {
        if (value !== "CBSE") { next.twelfthCbseMarks = ""; next.twelfthCbseSubjects = "5" }
        if (value !== "ICSE") { next.twelfthIcseMarks = "" }
        if (value === "STATE") next.twelfthPercentage = ""
      }

      // Auto-calculate diploma year totals and percentage
      if (["diplomaFirstYear", "diplomaSecondYear", "diplomaThirdYear"].includes(field)) {
        const fy = parseFloat(field === "diplomaFirstYear" ? (value as string) : prev.diplomaFirstYear)
        const sy = parseFloat(field === "diplomaSecondYear" ? (value as string) : prev.diplomaSecondYear)
        const ty = parseFloat(field === "diplomaThirdYear" ? (value as string) : prev.diplomaThirdYear)
        if (!isNaN(fy) && !isNaN(sy) && !isNaN(ty) && fy <= 1000 && sy <= 1800 && ty <= 1200) {
          next.diplomaPercentage = ((fy * 0.25 + sy * 0.5 + ty) / 2350 * 100).toFixed(2)
        }
      }

      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSemesterChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const sems = prev.diplomaSemesters.map((s, i) => i === index ? { ...s, [field]: value } : s)
      const next = { ...prev, diplomaSemesters: sems }

      if (field === "marks") {
        const [s0, s1, s2, s3, s4, s5] = sems.map((s) => parseFloat(s.marks || "0"))
        const fy = (index <= 1) ? (s0 + s1) : parseFloat(prev.diplomaFirstYear || "0")
        const sy = (index === 2 || index === 3) ? (s2 + s3) : parseFloat(prev.diplomaSecondYear || "0")
        const ty = (index >= 4) ? (s4 + s5) : parseFloat(prev.diplomaThirdYear || "0")
        if (fy <= 1000) next.diplomaFirstYear = (index <= 1) ? fy.toString() : prev.diplomaFirstYear
        if (sy <= 1800) next.diplomaSecondYear = (index === 2 || index === 3) ? sy.toString() : prev.diplomaSecondYear
        if (ty <= 1200) next.diplomaThirdYear = (index >= 4) ? ty.toString() : prev.diplomaThirdYear

        const fyN = parseFloat(next.diplomaFirstYear || "0")
        const syN = parseFloat(next.diplomaSecondYear || "0")
        const tyN = parseFloat(next.diplomaThirdYear || "0")
        if (fyN <= 1000 && syN <= 1800 && tyN <= 1200) {
          next.diplomaPercentage = ((fyN * 0.25 + syN * 0.5 + tyN) / 2350 * 100).toFixed(2)
        }
      }

      return next
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}

    // 10th
    if (!formData.tenthSchool.trim()) e.tenthSchool = "Required"
    if (!formData.tenthArea.trim()) e.tenthArea = "Required"
    if (!formData.tenthDistrict.trim()) e.tenthDistrict = "Required"
    if (!formData.tenthCity.trim()) e.tenthCity = "Required"
    if (!formData.tenthPincode.trim()) e.tenthPincode = "Required"
    else if (!/^\d{6}$/.test(formData.tenthPincode)) e.tenthPincode = "Must be 6 digits"
    if (!formData.tenthBoard) e.tenthBoard = "Required"
    if (!formData.tenthPassingYear) e.tenthPassingYear = "Required"
    if (!formData.tenthPassingMonth) e.tenthPassingMonth = "Required"
    if (!formData.tenthPercentage) e.tenthPercentage = "Required"
    if (!formData.tenthMarksCard) e.tenthMarksCard = "Required"

    // Academic level
    if (!formData.academicLevel) e.academicLevel = "Please select 12th Standard or Diploma"

    // 12th
    if (formData.academicLevel === "12th") {
      if (!formData.twelfthSchool.trim()) e.twelfthSchool = "Required"
      if (!formData.twelfthArea.trim()) e.twelfthArea = "Required"
      if (!formData.twelfthDistrict.trim()) e.twelfthDistrict = "Required"
      if (!formData.twelfthCity.trim()) e.twelfthCity = "Required"
      if (!formData.twelfthPincode.trim()) e.twelfthPincode = "Required"
      else if (!/^\d{6}$/.test(formData.twelfthPincode)) e.twelfthPincode = "Must be 6 digits"
      if (!formData.twelfthBoard) e.twelfthBoard = "Required"
      if (!formData.twelfthPassingYear) e.twelfthPassingYear = "Required"
      if (!formData.twelfthPassingMonth) e.twelfthPassingMonth = "Required"
      if (formData.twelfthBoard === "STATE" && !formData.twelfthPercentage) e.twelfthPercentage = "Required"
      if (formData.twelfthBoard === "CBSE" && !formData.twelfthCbseMarks) e.twelfthCbseMarks = "Required"
      if (formData.twelfthBoard === "ICSE" && !formData.twelfthIcseMarks) e.twelfthIcseMarks = "Required"
      if (!formData.twelfthMarksCard) e.twelfthMarksCard = "Required"
    }

    // Diploma
    if (formData.academicLevel === "Diploma") {
      if (!formData.diplomaCollege.trim()) e.diplomaCollege = "Required"
      if (!formData.diplomaArea.trim()) e.diplomaArea = "Required"
      if (!formData.diplomaDistrict.trim()) e.diplomaDistrict = "Required"
      if (!formData.diplomaCity.trim()) e.diplomaCity = "Required"
      if (!formData.diplomaPincode.trim()) e.diplomaPincode = "Required"
      else if (!/^\d{6}$/.test(formData.diplomaPincode)) e.diplomaPincode = "Must be 6 digits"
      formData.diplomaSemesters.forEach((sem, i) => {
        if (!sem.sgpa) e[`diploma_sem${i + 1}_sgpa`] = "Required"
        if (!sem.cgpa) e[`diploma_sem${i + 1}_cgpa`] = "Required"
        if (!sem.marks) e[`diploma_sem${i + 1}_marks`] = "Required"
      })
      if (!formData.diplomaFirstYear) e.diplomaFirstYear = "Required"
      if (!formData.diplomaSecondYear) e.diplomaSecondYear = "Required"
      if (!formData.diplomaThirdYear) e.diplomaThirdYear = "Required"
      if (!formData.diplomaPercentage) e.diplomaPercentage = "Calculation failed — check semester marks"
      if (!formData.diplomaCertificates) e.diplomaCertificates = "Required"
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (validate()) onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 steps-form">

      <TenthForm data={formData} errors={errors} onChange={handleChange} />

      {/* Academic level selector */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">12th / Diploma</CardTitle>
          <CardDescription>Select your path after 10th standard</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.academicLevel}
            onValueChange={(v) => handleChange("academicLevel", v)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="12th" id="lvl-12th" />
              <Label htmlFor="lvl-12th" className="cursor-pointer font-normal">12th Standard</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="Diploma" id="lvl-diploma" />
              <Label htmlFor="lvl-diploma" className="cursor-pointer font-normal">Diploma</Label>
            </div>
          </RadioGroup>
          {errors.academicLevel && <p className="form-error mt-2">{errors.academicLevel}</p>}
        </CardContent>
      </Card>

      {formData.academicLevel === "12th" && (
        <TwelfthForm data={formData} errors={errors} onChange={handleChange} />
      )}

      {formData.academicLevel === "Diploma" && (
        <DiplomaForm
          data={formData}
          errors={errors}
          onChange={handleChange}
          onSemesterChange={handleSemesterChange}
        />
      )}

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onPrevious} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button type="submit" className="ml-auto px-8">
          Continue
        </Button>
      </div>
    </form>
  )
}
