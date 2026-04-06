"use client"

import { useState, useEffect } from "react"
import DOMPurify from "dompurify"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft, MapPin, Clock, Briefcase, Users, AlertCircle,
  CheckCircle2, GraduationCap, Calendar, Building2
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  description: string
  location: string
  jobType: string
  workMode: string
  salary: number
  minSalary?: number
  maxSalary?: number
  tier: string
  category: string
  isDreamOffer: boolean
  minCGPA?: number
  allowedBranches: string[]
  eligibleBatch?: string
  maxBacklogs?: number
  requiredSkills: string[]
  preferredSkills: string[]
  deadline?: string
  startDate?: string
  noOfPositions?: number
  createdAt: string
  _count: { applications: number }
}

const TIER_CONFIG: Record<string, { label: string; border: string; badge: string }> = {
  DREAM:  { label: "Dream",  border: "border-l-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-100" },
  TIER_1: { label: "Tier 1", border: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  TIER_2: { label: "Tier 2", border: "border-l-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-100" },
  TIER_3: { label: "Tier 3", border: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-100" },
}

const WORK_MODE_LABELS: Record<string, string> = {
  OFFICE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid", FLEXIBLE: "Flexible",
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", INTERNSHIP: "Internship",
  CONTRACT: "Contract", FREELANCE: "Freelance",
}

const CATEGORY_LABELS: Record<string, string> = {
  TRAINING_INTERNSHIP: "Training + Internship", INTERNSHIP: "Internship", FTE: "Full Time Employment",
}

function CompanyAvatar({ name, logo }: { name: string; logo?: string }) {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
  ]
  const idx = name.charCodeAt(0) % colors.length
  if (logo) return <img src={logo} alt={name} className="h-14 w-14 rounded-xl object-cover border border-[#E8E5E1]" />
  return (
    <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold", colors[idx])}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQRDialog, setShowQRDialog] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.data.job)
          setHasApplied(data.data.hasApplied)
        } else {
          toast.error("Job not found")
          router.push("/jobs")
        }
      } catch {
        toast.error("Failed to load job details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchJob()
  }, [params.id, router])

  const handleApply = async () => {
    setIsApplying(true)
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (response.ok) {
        const data = await response.json()
        toast.success("Application submitted!")
        setHasApplied(true)
        if (data.qrCode) { setQrCode(data.qrCode); setShowQRDialog(true) }
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to apply")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-[#E8E5E1] bg-white animate-pulse" />
        ))}
      </div>
    )
  }

  if (!job) return null

  const tier = job.isDreamOffer ? "DREAM" : job.tier
  const tierCfg = TIER_CONFIG[tier] ?? TIER_CONFIG.TIER_3
  const isDeadlinePassed = job.deadline && new Date(job.deadline) < new Date()
  const isDeadlineSoon = job.deadline &&
    new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && !isDeadlinePassed

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-5">

      {/* Back */}
      <Link href="/jobs">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F0EB] -ml-2 h-8 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Jobs
        </Button>
      </Link>

      {/* Header card */}
      <div className={cn(
        "rounded-2xl border border-[#E8E5E1] border-l-4 bg-white p-6",
        tierCfg.border
      )}>
        <div className="flex items-start gap-4">
          <CompanyAvatar name={job.companyName} logo={job.companyLogo} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-[#18181B]">{job.title}</h1>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide",
                tierCfg.badge
              )}>
                {tierCfg.label}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#F4F0EB] px-2 py-0.5 text-[10px] text-[#52525B]">
                {CATEGORY_LABELS[job.category] ?? job.category}
              </span>
              {hasApplied && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Applied
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-[#71717A]">{job.companyName}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</span>
              <span>{WORK_MODE_LABELS[job.workMode] ?? job.workMode}</span>
              <span className="font-medium text-[#52525B]">
                {job.salary ? `₹${job.salary} LPA` : job.minSalary && job.maxSalary ? `₹${job.minSalary}–${job.maxSalary} LPA` : ""}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {hasApplied ? (
              <Button disabled className="bg-[#F4F0EB] text-[#52525B] border border-[#E8E5E1] shadow-none h-9 text-sm">
                Applied
              </Button>
            ) : isDeadlinePassed ? (
              <Button disabled className="h-9 text-sm bg-[#F4F4F5] text-[#A1A1AA] shadow-none">
                Deadline passed
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={isApplying}
                className="h-9 text-sm bg-[#18181B] hover:bg-[#27272A] text-white"
              >
                {isApplying ? "Applying…" : "Apply Now"}
              </Button>
            )}
            <span className="text-[11px] text-[#A1A1AA]">{job._count.applications} applied</span>
          </div>
        </div>

        {/* Key meta strip */}
        <div className="mt-5 pt-4 border-t border-[#F0EDE8] grid grid-cols-2 sm:grid-cols-4 gap-3">
          {job.noOfPositions && (
            <div className="text-center">
              <p className="text-xs text-[#A1A1AA]">Positions</p>
              <p className="text-sm font-semibold text-[#18181B] mt-0.5">{job.noOfPositions}</p>
            </div>
          )}
          {job.deadline && (
            <div className="text-center">
              <p className="text-xs text-[#A1A1AA]">Deadline</p>
              <p className={cn(
                "text-sm font-semibold mt-0.5",
                isDeadlineSoon ? "text-red-500" : "text-[#18181B]"
              )}>
                {format(new Date(job.deadline), "MMM d, yyyy")}
              </p>
            </div>
          )}
          {job.startDate && (
            <div className="text-center">
              <p className="text-xs text-[#A1A1AA]">Start Date</p>
              <p className="text-sm font-semibold text-[#18181B] mt-0.5">{format(new Date(job.startDate), "MMM d, yyyy")}</p>
            </div>
          )}
          {job.minCGPA && (
            <div className="text-center">
              <p className="text-xs text-[#A1A1AA]">Min CGPA</p>
              <p className="text-sm font-semibold text-[#18181B] mt-0.5">{job.minCGPA}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Description */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[#E8E5E1] bg-white p-6">
            <h2 className="font-display text-base font-semibold text-[#18181B] mb-4">Job Description</h2>
            <div
              className="prose prose-sm max-w-none text-[#52525B] prose-headings:font-semibold prose-headings:text-[#18181B] prose-a:text-amber-600"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          </div>

          {(job.requiredSkills.length > 0 || job.preferredSkills.length > 0) && (
            <div className="rounded-2xl border border-[#E8E5E1] bg-white p-6">
              <h2 className="font-display text-base font-semibold text-[#18181B] mb-4">Skills</h2>
              {job.requiredSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-2">Required</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[#18181B] px-2.5 py-1 text-[11px] font-medium text-white">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.preferredSkills.length > 0 && (
                <div>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide mb-2">Preferred</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[#F4F0EB] px-2.5 py-1 text-[11px] text-[#52525B]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Eligibility sidebar */}
        <div>
          <div className="rounded-2xl border border-[#E8E5E1] bg-white p-5">
            <h2 className="font-display text-base font-semibold text-[#18181B] mb-4">Eligibility</h2>
            <div className="space-y-3">
              {job.minCGPA && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#F4F0EB] flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4 text-[#71717A]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wide">Min CGPA</p>
                    <p className="text-sm font-medium text-[#18181B]">{job.minCGPA}</p>
                  </div>
                </div>
              )}
              {job.maxBacklogs !== null && job.maxBacklogs !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#F4F0EB] flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 text-[#71717A]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wide">Backlogs</p>
                    <p className="text-sm font-medium text-[#18181B]">
                      {job.maxBacklogs === 0 ? "None allowed" : `Max ${job.maxBacklogs}`}
                    </p>
                  </div>
                </div>
              )}
              {job.eligibleBatch && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#F4F0EB] flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-[#71717A]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wide">Batch</p>
                    <p className="text-sm font-medium text-[#18181B]">{job.eligibleBatch}</p>
                  </div>
                </div>
              )}
              {job.allowedBranches.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wide mb-2">Branches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.allowedBranches.map((branch) => (
                      <span key={branch} className="rounded-full bg-[#F4F0EB] px-2 py-0.5 text-[11px] text-[#52525B]">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Submitted!</DialogTitle>
            <DialogDescription>
              Save this QR code for attendance tracking at placement events
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrCode && (
              <img src={qrCode} alt="Application QR Code" className="w-64 h-64 rounded-xl" />
            )}
            <p className="text-sm text-[#71717A] mt-4 text-center">
              Show this QR code at events for {job.companyName}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQRDialog(false)} className="bg-[#18181B] text-white hover:bg-[#27272A]">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
