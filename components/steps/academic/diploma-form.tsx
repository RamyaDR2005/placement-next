"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DocumentUpload } from "@/components/ui/document-upload"
import type { AcademicFormData } from "./shared"
import { STATES } from "./shared"

const SEM_ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"]
const YEAR_GROUPS = [
  { label: "First Year", indices: [0, 1] },
  { label: "Second Year", indices: [2, 3] },
  { label: "Third Year", indices: [4, 5] },
]

interface DiplomaFormProps {
  data: AcademicFormData
  errors: Record<string, string>
  onChange: (field: string, value: string | File | null) => void
  onSemesterChange: (index: number, field: string, value: string) => void
}

export function DiplomaForm({ data, errors, onChange, onSemesterChange }: DiplomaFormProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Diploma</CardTitle>
        <CardDescription>Details of your diploma education</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Institution details */}
        <div className="form-grid-cols-2">
          {(["diplomaCollege", "diplomaArea", "diplomaDistrict", "diplomaCity"] as const).map((name) => {
            const labels: Record<string, string> = {
              diplomaCollege: "College Name *",
              diplomaArea: "Area *",
              diplomaDistrict: "District *",
              diplomaCity: "City *",
            }
            const placeholders: Record<string, string> = {
              diplomaCollege: "Enter college name",
              diplomaArea: "Enter area",
              diplomaDistrict: "Enter district",
              diplomaCity: "Enter city",
            }
            return (
              <div key={name}>
                <Label htmlFor={name}>{labels[name]}</Label>
                <Input
                  id={name}
                  value={data[name]}
                  onChange={(e) => onChange(name, e.target.value)}
                  className={errors[name] ? "border-red-500" : ""}
                  placeholder={placeholders[name]}
                />
                {errors[name] && <p className="form-error">{errors[name]}</p>}
              </div>
            )
          })}
          <div>
            <Label htmlFor="diplomaPincode">PIN Code *</Label>
            <Input
              id="diplomaPincode"
              value={data.diplomaPincode}
              onChange={(e) => onChange("diplomaPincode", e.target.value)}
              className={errors.diplomaPincode ? "border-red-500" : ""}
              placeholder="6-digit PIN code"
              maxLength={6}
            />
            {errors.diplomaPincode && <p className="form-error">{errors.diplomaPincode}</p>}
          </div>
          <div>
            <Label>State</Label>
            <Select value={data.diplomaState} onValueChange={(v) => onChange("diplomaState", v)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Semester-wise details */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-neutral-800">Semester-wise Details</p>
          {YEAR_GROUPS.map(({ label, indices }) => (
            <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</p>
              {indices.map((si) => (
                <div key={si} className="form-grid-cols-3">
                  <div>
                    <Label>{SEM_ORDINALS[si]} Sem SGPA *</Label>
                    <Input
                      type="number"
                      value={data.diplomaSemesters[si]?.sgpa ?? ""}
                      onChange={(e) => onSemesterChange(si, "sgpa", e.target.value)}
                      className={errors[`diploma_sem${si + 1}_sgpa`] ? "border-red-500" : ""}
                      placeholder="0.00"
                      min="0" max="10" step="0.01"
                    />
                    {errors[`diploma_sem${si + 1}_sgpa`] && (
                      <p className="form-error">{errors[`diploma_sem${si + 1}_sgpa`]}</p>
                    )}
                  </div>
                  <div>
                    <Label>{SEM_ORDINALS[si]} Sem CGPA *</Label>
                    <Input
                      type="number"
                      value={data.diplomaSemesters[si]?.cgpa ?? ""}
                      onChange={(e) => onSemesterChange(si, "cgpa", e.target.value)}
                      className={errors[`diploma_sem${si + 1}_cgpa`] ? "border-red-500" : ""}
                      placeholder="0.00"
                      min="0" max="10" step="0.01"
                    />
                    {errors[`diploma_sem${si + 1}_cgpa`] && (
                      <p className="form-error">{errors[`diploma_sem${si + 1}_cgpa`]}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      {SEM_ORDINALS[si]} Sem Marks *
                      {si === 5 && <span className="text-neutral-400 font-normal"> (Industrial Training)</span>}
                    </Label>
                    <Input
                      type="number"
                      value={data.diplomaSemesters[si]?.marks ?? ""}
                      onChange={(e) => onSemesterChange(si, "marks", e.target.value)}
                      className={errors[`diploma_sem${si + 1}_marks`] ? "border-red-500" : ""}
                      placeholder="Enter marks"
                      min="0"
                    />
                    {errors[`diploma_sem${si + 1}_marks`] && (
                      <p className="form-error">{errors[`diploma_sem${si + 1}_marks`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Marks calculation */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-800">Calculated Totals</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              1Y × 25% + 2Y × 50% + 3Y × 100% ÷ 2350 = %
            </p>
          </div>
          <div className="form-grid-cols-2">
            {[
              { field: "diplomaFirstYear", label: "First Year Total (max 1000)", max: 1000 },
              { field: "diplomaSecondYear", label: "Second Year Total (max 1800)", max: 1800 },
              { field: "diplomaThirdYear", label: "Third Year Total (max 1200)", max: 1200 },
            ].map(({ field, label, max }) => (
              <div key={field}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={(data as unknown as Record<string, string>)[field]}
                  readOnly
                  className="bg-white text-neutral-500"
                  placeholder="Auto-calculated"
                  min="0"
                  max={max}
                />
                {errors[field] && <p className="form-error">{errors[field]}</p>}
              </div>
            ))}
            <div>
              <Label>Diploma Percentage</Label>
              <Input
                type="text"
                value={data.diplomaPercentage ? `${data.diplomaPercentage}%` : ""}
                readOnly
                className="bg-white font-semibold"
                placeholder="Auto-calculated"
              />
              {errors.diplomaPercentage && <p className="form-error">{errors.diplomaPercentage}</p>}
            </div>
          </div>
        </div>

        <DocumentUpload
          onFileChange={(file) => onChange("diplomaCertificates", file)}
          accept="application/pdf"
          maxSizeMB={200}
          label="All Diploma Semester Certificates *"
          required
          error={errors.diplomaCertificates}
          initialFile={data.diplomaCertificates as File | null}
          description="Format: USN_Diploma_All_Semesters.pdf · Max 200MB · PDF only · Combine all semesters"
          placeholder="Drop diploma certificates PDF here or click to select"
        />
      </CardContent>
    </Card>
  )
}
