"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Download, Send } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading"
import { toast } from "sonner"

interface ReviewStepProps {
  onPrevious: () => void
  onSubmit?: () => Promise<void>
  formData: any
}

export function ReviewStep({ onPrevious, onSubmit, formData }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Call the parent's submit handler if provided
      if (onSubmit) {
        await onSubmit()
      } else {
        // Fallback: direct API call to mark profile as complete
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isComplete: true,
            kycStatus: "PENDING",
            completionStep: 5
          })
        })

        if (!response.ok) {
          throw new Error("Failed to submit profile")
        }

        toast.success("Profile submitted successfully! Your KYC verification is pending.", {
          duration: 5000,
          description: "Please visit the Placement Cell with your documents."
        })

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Failed to submit profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = () => {
    setIsDownloading(true)
    // TODO: Implement PDF generation
    toast.info("PDF download will be available soon!")
    setTimeout(() => setIsDownloading(false), 1000)
  }

  // Helper to format date
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "Not provided"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    } catch {
      return String(dateStr)
    }
  }

  // Extract data from nested structure - matching the profile-completion.tsx structure
  const personalInfo = formData?.personalInfo || {}
  const contactDetails = formData?.contactDetails || {}
  const addressDetails = formData?.addressDetails || {}
  const tenthDetails = formData?.tenthDetails || {}
  const twelfthDiplomaDetails = formData?.twelfthDiplomaDetails || {}
  const engineeringDetails = formData?.engineeringDetails || {}
  const engineeringAcademicDetails = formData?.engineeringAcademicDetails || {}

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Submission Notice */}
        <p className="text-sm text-muted-foreground">
          Your KYC verification is pending. Please visit the Placement Cell with all submitted documents for verification.
        </p>

        {/* Personal Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {personalInfo.firstName || "Not provided"} {personalInfo.middleName || ""} {personalInfo.lastName || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {formatDate(personalInfo.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{personalInfo.gender || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{personalInfo.bloodGroup || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge variant="secondary">{personalInfo.casteCategory || "Not provided"}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State of Domicile</p>
                <p className="font-medium">{personalInfo.stateOfDomicile || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student Email</p>
                <p className="font-medium">{contactDetails.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calling Number</p>
                <p className="font-medium">{contactDetails.callingMobile || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp Number</p>
                <p className="font-medium">{contactDetails.whatsappMobile || "Not provided"}</p>
              </div>
              {contactDetails.alternativeMobile && (
                <div>
                  <p className="text-sm text-muted-foreground">Alternative Number</p>
                  <p className="font-medium">{contactDetails.alternativeMobile}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Parent Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Father's Name</p>
                <p className="font-medium">{contactDetails.fatherName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Father's Mobile</p>
                <p className="font-medium">{contactDetails.fatherMobile || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mother's Name</p>
                <p className="font-medium">{contactDetails.motherName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mother's Mobile</p>
                <p className="font-medium">{contactDetails.motherMobile || "Not provided"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Current Address</h4>
              <p className="text-sm">
                {addressDetails.currentHouse || "Not provided"},
                {addressDetails.currentCross && ` ${addressDetails.currentCross}, `}
                {addressDetails.currentArea || ""},
                {addressDetails.currentCity || ""},
                {addressDetails.currentDistrict || ""} -
                {addressDetails.currentPincode || ""},
                {addressDetails.currentState || ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 10th Standard Summary */}
        <Card>
          <CardHeader>
            <CardTitle>10th Standard Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">School Name</p>
                <p className="font-medium">{tenthDetails.tenthSchoolName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{tenthDetails.tenthAreaDistrictCity || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Board</p>
                <p className="font-medium">{tenthDetails.tenthBoard || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year of Passing</p>
                <p className="font-medium">{tenthDetails.tenthPassingYear || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Month of Passing</p>
                <p className="font-medium">{tenthDetails.tenthPassingMonth || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="font-medium">{tenthDetails.tenthPercentage ? `${tenthDetails.tenthPercentage}%` : "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 12th/Diploma Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              {twelfthDiplomaDetails.twelfthOrDiploma === 'Diploma' ? 'Diploma Details' : '12th Standard Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {twelfthDiplomaDetails.twelfthOrDiploma === 'Diploma' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">College Name</p>
                  <p className="font-medium">{twelfthDiplomaDetails.diplomaCollege || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {[twelfthDiplomaDetails.diplomaArea, twelfthDiplomaDetails.diplomaDistrict, twelfthDiplomaDetails.diplomaCity].filter(Boolean).join(', ') || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="font-medium">{twelfthDiplomaDetails.diplomaPercentage ? `${twelfthDiplomaDetails.diplomaPercentage}%` : "Not provided"}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Name</p>
                  <p className="font-medium">{twelfthDiplomaDetails.twelfthSchoolName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {[twelfthDiplomaDetails.twelfthArea, twelfthDiplomaDetails.twelfthDistrict, twelfthDiplomaDetails.twelfthCity].filter(Boolean).join(', ') || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Board</p>
                  <p className="font-medium">{twelfthDiplomaDetails.twelfthBoard || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year of Passing</p>
                  <p className="font-medium">{twelfthDiplomaDetails.twelfthPassingYear || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="font-medium">{twelfthDiplomaDetails.twelfthStatePercentage ? `${twelfthDiplomaDetails.twelfthStatePercentage}%` : "Not provided"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engineering Details Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Engineering Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">College Name</p>
                <p className="font-medium">{engineeringDetails.collegeName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USN</p>
                <p className="font-medium">{engineeringDetails.usn || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{engineeringDetails.branch || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entry Type</p>
                <p className="font-medium">{engineeringDetails.entryType || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seat Category</p>
                <p className="font-medium">{engineeringDetails.seatCategory || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Library ID</p>
                <p className="font-medium">{engineeringDetails.libraryId || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch Mentor</p>
                <p className="font-medium">{engineeringDetails.branchMentorName || "Not provided"}</p>
              </div>
            </div>

            <Separator />

            <h4 className="font-medium">Academic Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Final CGPA</p>
                <p className="font-medium text-lg">{engineeringAcademicDetails.finalCgpa || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Backlogs</p>
                <p className="font-medium">{engineeringAcademicDetails.activeBacklogs ? "Yes" : "No"}</p>
              </div>
            </div>

            <Separator />

            <h4 className="font-medium">Social Profiles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engineeringDetails.linkedin && (
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <p className="font-medium truncate">{engineeringDetails.linkedin}</p>
                </div>
              )}
              {engineeringDetails.github && (
                <div>
                  <p className="text-sm text-muted-foreground">GitHub</p>
                  <p className="font-medium truncate">{engineeringDetails.github}</p>
                </div>
              )}
              {engineeringDetails.leetcode && (
                <div>
                  <p className="text-sm text-muted-foreground">LeetCode</p>
                  <p className="font-medium truncate">{engineeringDetails.leetcode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading || isSubmitting}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Summary
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="px-8 py-3 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Form
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}