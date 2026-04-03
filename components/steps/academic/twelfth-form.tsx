"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DocumentUpload } from "@/components/ui/document-upload"
import type { AcademicFormData } from "./shared"
import { STATES, MONTHS, generateYears } from "./shared"

interface TwelfthFormProps {
  data: AcademicFormData
  errors: Record<string, string>
  onChange: (field: string, value: string | File | null) => void
}

export function TwelfthForm({ data, errors, onChange }: TwelfthFormProps) {
  const years = generateYears()
  const maxMarks = data.twelfthCbseSubjects === "5" ? 500 : 600

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">12th Standard</CardTitle>
        <CardDescription>Details of your 12th standard education</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="form-grid-cols-2">
          <div>
            <Label htmlFor="twelfthSchool">School Name *</Label>
            <Input
              id="twelfthSchool"
              value={data.twelfthSchool}
              onChange={(e) => onChange("twelfthSchool", e.target.value)}
              className={errors.twelfthSchool ? "border-red-500" : ""}
              placeholder="Enter school name"
            />
            {errors.twelfthSchool && <p className="form-error">{errors.twelfthSchool}</p>}
          </div>
          <div>
            <Label htmlFor="twelfthArea">Area *</Label>
            <Input
              id="twelfthArea"
              value={data.twelfthArea}
              onChange={(e) => onChange("twelfthArea", e.target.value)}
              className={errors.twelfthArea ? "border-red-500" : ""}
              placeholder="Enter area"
            />
            {errors.twelfthArea && <p className="form-error">{errors.twelfthArea}</p>}
          </div>
          <div>
            <Label htmlFor="twelfthDistrict">District *</Label>
            <Input
              id="twelfthDistrict"
              value={data.twelfthDistrict}
              onChange={(e) => onChange("twelfthDistrict", e.target.value)}
              className={errors.twelfthDistrict ? "border-red-500" : ""}
              placeholder="Enter district"
            />
            {errors.twelfthDistrict && <p className="form-error">{errors.twelfthDistrict}</p>}
          </div>
          <div>
            <Label htmlFor="twelfthCity">City *</Label>
            <Input
              id="twelfthCity"
              value={data.twelfthCity}
              onChange={(e) => onChange("twelfthCity", e.target.value)}
              className={errors.twelfthCity ? "border-red-500" : ""}
              placeholder="Enter city"
            />
            {errors.twelfthCity && <p className="form-error">{errors.twelfthCity}</p>}
          </div>
          <div>
            <Label htmlFor="twelfthPincode">PIN Code *</Label>
            <Input
              id="twelfthPincode"
              value={data.twelfthPincode}
              onChange={(e) => onChange("twelfthPincode", e.target.value)}
              className={errors.twelfthPincode ? "border-red-500" : ""}
              placeholder="6-digit PIN code"
              maxLength={6}
            />
            {errors.twelfthPincode && <p className="form-error">{errors.twelfthPincode}</p>}
          </div>
          <div>
            <Label>State</Label>
            <Select value={data.twelfthState} onValueChange={(v) => onChange("twelfthState", v)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Board *</Label>
            <Select value={data.twelfthBoard} onValueChange={(v) => onChange("twelfthBoard", v)}>
              <SelectTrigger className={errors.twelfthBoard ? "border-red-500" : ""}>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STATE">STATE</SelectItem>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
              </SelectContent>
            </Select>
            {errors.twelfthBoard && <p className="form-error">{errors.twelfthBoard}</p>}
          </div>
          <div>
            <Label>Passing Year *</Label>
            <Select value={data.twelfthPassingYear} onValueChange={(v) => onChange("twelfthPassingYear", v)}>
              <SelectTrigger className={errors.twelfthPassingYear ? "border-red-500" : ""}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.twelfthPassingYear && <p className="form-error">{errors.twelfthPassingYear}</p>}
          </div>
          <div>
            <Label>Passing Month *</Label>
            <Select value={data.twelfthPassingMonth} onValueChange={(v) => onChange("twelfthPassingMonth", v)}>
              <SelectTrigger className={errors.twelfthPassingMonth ? "border-red-500" : ""}>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.twelfthPassingMonth && <p className="form-error">{errors.twelfthPassingMonth}</p>}
          </div>
          {data.twelfthBoard === "STATE" && (
            <div>
              <Label htmlFor="twelfthPercentage">Percentage *</Label>
              <Input
                id="twelfthPercentage"
                type="number"
                value={data.twelfthPercentage}
                onChange={(e) => onChange("twelfthPercentage", e.target.value)}
                className={errors.twelfthPercentage ? "border-red-500" : ""}
                placeholder="e.g. 85.50"
                min="0"
                max="100"
                step="0.01"
              />
              {errors.twelfthPercentage && <p className="form-error">{errors.twelfthPercentage}</p>}
            </div>
          )}
        </div>

        {/* CBSE-specific */}
        {data.twelfthBoard === "CBSE" && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
            <p className="text-sm font-medium text-neutral-700">CBSE Details</p>
            <div className="form-grid-cols-2">
              <div>
                <Label>Number of Subjects *</Label>
                <Select value={data.twelfthCbseSubjects} onValueChange={(v) => onChange("twelfthCbseSubjects", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Subjects (max 500)</SelectItem>
                    <SelectItem value="6">6 Subjects (max 600)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="twelfthCbseMarks">Total Marks *</Label>
                <Input
                  id="twelfthCbseMarks"
                  type="number"
                  value={data.twelfthCbseMarks}
                  onChange={(e) => onChange("twelfthCbseMarks", e.target.value)}
                  className={errors.twelfthCbseMarks ? "border-red-500" : ""}
                  placeholder={`Enter marks (max ${maxMarks})`}
                  min="0"
                  max={maxMarks}
                />
                {errors.twelfthCbseMarks && <p className="form-error">{errors.twelfthCbseMarks}</p>}
              </div>
            </div>
            {data.twelfthPercentage && (
              <p className="text-sm text-neutral-600">
                Calculated percentage: <span className="font-semibold">{data.twelfthPercentage}%</span>
              </p>
            )}
          </div>
        )}

        {/* ICSE-specific */}
        {data.twelfthBoard === "ICSE" && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
            <p className="text-sm font-medium text-neutral-700">ICSE Details</p>
            <div className="max-w-xs">
              <Label htmlFor="twelfthIcseMarks">Total Marks (out of 1000) *</Label>
              <Input
                id="twelfthIcseMarks"
                type="number"
                value={data.twelfthIcseMarks}
                onChange={(e) => onChange("twelfthIcseMarks", e.target.value)}
                className={errors.twelfthIcseMarks ? "border-red-500" : ""}
                placeholder="Enter marks"
                min="0"
                max="1000"
              />
              {errors.twelfthIcseMarks && <p className="form-error">{errors.twelfthIcseMarks}</p>}
            </div>
            {data.twelfthPercentage && (
              <p className="text-sm text-neutral-600">
                Calculated percentage: <span className="font-semibold">{data.twelfthPercentage}%</span>
              </p>
            )}
          </div>
        )}

        <DocumentUpload
          onFileChange={(file) => onChange("twelfthMarksCard", file)}
          accept="image/jpeg,image/png,application/pdf"
          maxSizeMB={20}
          label="12th Marks Card *"
          required
          error={errors.twelfthMarksCard}
          initialFile={data.twelfthMarksCard as File | null}
          description="Format: USN_12th_MarksCard.jpg/pdf · Max 20MB · JPG/PNG/PDF"
          placeholder="Drop marks card here or click to select"
        />
      </CardContent>
    </Card>
  )
}
