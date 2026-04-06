"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Clock, Users, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  location: string
  jobType: string
  workMode: string
  salary: string
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
  deadline?: string
  noOfPositions?: number
  createdAt: string
  _count: { applications: number }
  isEligible: boolean
  eligibilityIssues: string[]
  hasApplied: boolean
}

const TIER_CONFIG: Record<string, { label: string; border: string; badge: string; text: string }> = {
  DREAM:  { label: "Dream",  border: "border-l-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-100",   text: "text-violet-700" },
  TIER_1: { label: "Tier 1", border: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100", text: "text-emerald-700" },
  TIER_2: { label: "Tier 2", border: "border-l-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-100",          text: "text-blue-700" },
  TIER_3: { label: "Tier 3", border: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-100",       text: "text-amber-700" },
}

const WORK_MODE_LABELS: Record<string, string> = {
  OFFICE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid", FLEXIBLE: "Flexible",
}

function CompanyAvatar({ name, logo }: { name: string; logo?: string }) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ]
  const colorIdx = name.charCodeAt(0) % colors.length
  if (logo) {
    return <img src={logo} alt={name} className="h-11 w-11 rounded-xl object-cover border border-[#E8E5E1]" />
  }
  return (
    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold", colors[colorIdx])}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

function SalaryDisplay({ salary, min, max }: { salary?: string; min?: number; max?: number }) {
  if (salary) return <span className="font-semibold text-[#18181B]">{salary}</span>
  if (min && max) return <span className="font-semibold text-[#18181B]">₹{min}–{max} LPA</span>
  if (min) return <span className="font-semibold text-[#18181B]">₹{min}+ LPA</span>
  return <span className="text-[#A1A1AA]">Salary TBD</span>
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [search, setSearch] = useState("")
  const [jobType, setJobType] = useState("ALL")
  const [workMode, setWorkMode] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" })
      if (search) params.append("search", search)
      if (jobType !== "ALL") params.append("jobType", jobType)
      if (workMode !== "ALL") params.append("workMode", workMode)
      const res = await fetch(`/api/jobs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(data.data.jobs)
        setTotalPages(data.data.pagination.pages)
        setTotal(data.data.pagination.total)
        setRegistrationOpen(data.data.registrationOpen ?? true)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [page, jobType, workMode])
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchJobs() }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
            Job Opportunities
          </h1>
          <p className="mt-1 text-sm text-[#71717A]">
            {total > 0 ? `${total} open position${total !== 1 ? "s" : ""} available` : "Browse placement opportunities"}
          </p>
        </div>
      </div>

      {/* Registration closed */}
      {!registrationOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Applications temporarily paused</p>
            <p className="text-xs text-amber-700 mt-0.5">You can still browse positions. Check back soon.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] h-4 w-4" />
          <Input
            placeholder="Search jobs or companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-[#E8E5E1] bg-white placeholder:text-[#A1A1AA] focus-visible:ring-amber-400/40"
          />
        </div>
        <Select value={jobType} onValueChange={(v) => { setJobType(v); setPage(1) }}>
          <SelectTrigger className="h-10 w-full sm:w-36 border-[#E8E5E1] bg-white text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
          </SelectContent>
        </Select>
        <Select value={workMode} onValueChange={(v) => { setWorkMode(v); setPage(1) }}>
          <SelectTrigger className="h-10 w-full sm:w-36 border-[#E8E5E1] bg-white text-sm">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Modes</SelectItem>
            <SelectItem value="OFFICE">On-site</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="h-10 shrink-0 bg-[#18181B] hover:bg-[#27272A] text-white text-sm">
          Search
        </Button>
      </form>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-[#E8E5E1] bg-white animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E5E1] bg-white py-16 text-center">
          <Search className="mx-auto h-8 w-8 text-[#D4CFC9]" />
          <p className="mt-3 text-sm font-medium text-[#52525B]">No jobs found</p>
          <p className="mt-1 text-xs text-[#A1A1AA]">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const tier = job.isDreamOffer ? "DREAM" : job.tier
            const tierCfg = TIER_CONFIG[tier] ?? TIER_CONFIG.TIER_3
            const isDeadlineSoon = job.deadline &&
              new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000

            return (
              <div
                key={job.id}
                className={cn(
                  "group relative flex items-start gap-4 rounded-2xl border border-[#E8E5E1] border-l-4 bg-white p-5 transition-all hover:border-[#D4CFC9] hover:shadow-sm",
                  tierCfg.border,
                  !job.isEligible && "opacity-55"
                )}
              >
                <CompanyAvatar name={job.companyName} logo={job.companyLogo} />

                <div className="min-w-0 flex-1">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#18181B] leading-tight">{job.title}</h3>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide",
                      tierCfg.badge
                    )}>
                      {tierCfg.label}
                    </span>
                    {job.hasApplied && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] font-medium text-[#52525B]">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Applied
                      </span>
                    )}
                  </div>

                  {/* Company & meta */}
                  <p className="mt-0.5 text-sm text-[#71717A]">{job.companyName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                    <span>{WORK_MODE_LABELS[job.workMode] ?? job.workMode}</span>
                    <span className="font-medium text-[#52525B]">
                      <SalaryDisplay salary={job.salary} min={job.minSalary} max={job.maxSalary} />
                    </span>
                    {job.noOfPositions && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{job.noOfPositions} positions
                      </span>
                    )}
                    {job.deadline && (
                      <span className={cn(
                        "flex items-center gap-1",
                        isDeadlineSoon ? "text-red-500 font-medium" : ""
                      )}>
                        <Clock className="h-3 w-3" />
                        {isDeadlineSoon ? "Closes " : "Due "}
                        {format(new Date(job.deadline), "MMM d")}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {job.requiredSkills.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {job.requiredSkills.slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded-full bg-[#F4F0EB] px-2 py-0.5 text-[11px] text-[#52525B]">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="rounded-full bg-[#F4F0EB] px-2 py-0.5 text-[11px] text-[#A1A1AA]">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ineligible reason */}
                  {!job.isEligible && job.eligibilityIssues[0] && (
                    <p className="mt-2 text-xs text-red-500">{job.eligibilityIssues[0]}</p>
                  )}
                </div>

                {/* CTA */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link href={`/jobs/${job.id}`}>
                    <Button
                      size="sm"
                      className={cn(
                        "h-8 gap-1 text-xs",
                        job.hasApplied
                          ? "bg-[#F4F0EB] text-[#52525B] hover:bg-[#EDE9E3] shadow-none border border-[#E8E5E1]"
                          : job.isEligible
                            ? "bg-[#18181B] text-white hover:bg-[#27272A]"
                            : "bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed shadow-none"
                      )}
                      disabled={!job.isEligible && !job.hasApplied}
                    >
                      {job.hasApplied ? "View" : "Apply"}
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <span className="text-[11px] text-[#A1A1AA]">{job._count.applications} applied</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 border-[#E8E5E1] text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-[#A1A1AA]">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 border-[#E8E5E1] text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
