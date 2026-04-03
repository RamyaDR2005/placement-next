"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DocumentUpload } from "@/components/ui/document-upload"
import type { AcademicFormData } from "./shared"
import { STATES, MONTHS, generateYears } from "./shared"

interface TenthFormProps {
  data: AcademicFormData
  errors: Record<string, string>
  onChange: (field: string, value: string | File | null) => void
}

export function TenthForm({ data, errors, onChange }: TenthFormProps) {
  const years = generateYears()

  const field = (name: string, label: string, placeholder: string) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        value={(data as unknown as Record<string, string>)[name] ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        className={errors[name] ? "border-red-500" : ""}
        placeholder={placeholder}
      />
      {errors[name] && <p className="form-error">{errors[name]}</p>}
    </div>
  )

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">10th Standard</CardTitle>
        <CardDescription>Details of your 10th standard education</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="form-grid-cols-2">
          {field("tenthSchool", "School Name *", "Enter school name")}
          {field("tenthArea", "Area *", "Enter area")}
          {field("tenthDistrict", "District *", "Enter district")}
          {field("tenthCity", "City *", "Enter city")}
          <div>
            <Label htmlFor="tenthPincode">PIN Code *</Label>
            <Input
              id="tenthPincode"
              value={data.tenthPincode}
              onChange={(e) => onChange("tenthPincode", e.target.value)}
              className={errors.tenthPincode ? "border-red-500" : ""}
              placeholder="6-digit PIN code"
              maxLength={6}
            />
            {errors.tenthPincode && <p className="form-error">{errors.tenthPincode}</p>}
          </div>
          <div>
            <Label>State</Label>
            <Select value={data.tenthState} onValueChange={(v) => onChange("tenthState", v)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Board *</Label>
            <Select value={data.tenthBoard} onValueChange={(v) => onChange("tenthBoard", v)}>
              <SelectTrigger className={errors.tenthBoard ? "border-red-500" : ""}>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STATE">STATE</SelectItem>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="ICSE">ICSE</SelectItem>
              </SelectContent>
            </Select>
            {errors.tenthBoard && <p className="form-error">{errors.tenthBoard}</p>}
          </div>
          <div>
            <Label>Passing Year *</Label>
            <Select value={data.tenthPassingYear} onValueChange={(v) => onChange("tenthPassingYear", v)}>
              <SelectTrigger className={errors.tenthPassingYear ? "border-red-500" : ""}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tenthPassingYear && <p className="form-error">{errors.tenthPassingYear}</p>}
          </div>
          <div>
            <Label>Passing Month *</Label>
            <Select value={data.tenthPassingMonth} onValueChange={(v) => onChange("tenthPassingMonth", v)}>
              <SelectTrigger className={errors.tenthPassingMonth ? "border-red-500" : ""}>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.tenthPassingMonth && <p className="form-error">{errors.tenthPassingMonth}</p>}
          </div>
          <div>
            <Label htmlFor="tenthPercentage">Percentage *</Label>
            <Input
              id="tenthPercentage"
              type="number"
              value={data.tenthPercentage}
              onChange={(e) => onChange("tenthPercentage", e.target.value)}
              className={errors.tenthPercentage ? "border-red-500" : ""}
              placeholder="e.g. 87.50"
              min="0"
              max="100"
              step="0.01"
            />
            {errors.tenthPercentage && <p className="form-error">{errors.tenthPercentage}</p>}
          </div>
        </div>

        <DocumentUpload
          onFileChange={(file) => onChange("tenthMarksCard", file)}
          accept="image/jpeg,image/png,application/pdf"
          maxSizeMB={20}
          label="10th Marks Card *"
          required
          error={errors.tenthMarksCard}
          initialFile={data.tenthMarksCard as File | null}
          description="Format: USN_10th_MarksCard.jpg/pdf · Max 20MB · JPG/PNG/PDF"
          placeholder="Drop marks card here or click to select"
        />
      </CardContent>
    </Card>
  )
}
