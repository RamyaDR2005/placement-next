"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Job {
  id: string
  title: string
  companyName: string
  companyLogo?: string
  location: string
  jobType: string
  workMode: string
  salary: number
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

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time",
  INTERNSHIP: "Internship", CONTRACT: "Contract", FREELANCE: "Freelance",
}
const WORK_MODE_LABELS: Record<string, string> = {
  OFFICE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid", FLEXIBLE: "Flexible",
}
const CATEGORY_LABELS: Record<string, string> = {
  TRAINING_INTERNSHIP: "Training + Internship", INTERNSHIP: "Internship", FTE: "Full Time",
}

function getTierLabel(tier: string, isDreamOffer: boolean) {
  if (isDreamOffer) return "Dream"
  return tier.replace("_", " ")
}

function CompanyInitial({ name, logo }: { name: string; logo?: string }) {
  if (logo) return <img src={logo} alt={name} className="w-9 h-9 rounded-lg object-cover" />
  return (
    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-neutral-500">{name[0]?.toUpperCase()}</span>
    </div>
  )
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Job Opportunities</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Explore and apply to placement opportunities</p>
      </div>

      {/* Registration closed banner */}
      {!registrationOpen && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-900">Applications are currently closed</p>
          <p className="text-amber-700 mt-0.5">The placement cell has temporarily paused new applications. You can still browse positions.</p>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            placeholder="Search jobs or companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
            <SelectItem value="PART_TIME">Part Time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
          </SelectContent>
        </Select>
        <Select value={workMode} onValueChange={setWorkMode}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Work Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Modes</SelectItem>
            <SelectItem value="OFFICE">On-site</SelectItem>
            <SelectItem value="REMOTE">Remote</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-neutral-200 bg-neutral-50 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 py-16 text-center">
          <p className="text-sm font-medium text-neutral-700">No jobs found</p>
          <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`border-neutral-200 hover:border-neutral-300 transition-colors ${!job.isEligible ? "opacity-60" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <CompanyInitial name={job.companyName} logo={job.companyLogo} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-neutral-900">{job.title}</h3>
                        {job.isDreamOffer && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">Dream</Badge>
                        )}
                        {!job.isDreamOffer && job.tier === "TIER_1" && (
                          <Badge className="text-xs px-1.5 py-0">Tier 1</Badge>
                        )}
                        {job.hasApplied && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">Applied</Badge>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{job.companyName}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-neutral-400">
                        <span>{job.location}</span>
                        <span>{JOB_TYPE_LABELS[job.jobType] ?? job.jobType}</span>
                        <span>{WORK_MODE_LABELS[job.workMode] ?? job.workMode}</span>
                        <span className="text-neutral-700 font-medium">₹{job.salary} LPA</span>
                        {job.noOfPositions && <span>{job.noOfPositions} positions</span>}
                        {job.deadline && <span>Due {format(new Date(job.deadline), "MMM d")}</span>}
                      </div>
                      {job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <span key={skill} className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400">
                              +{job.requiredSkills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      {!job.isEligible && job.eligibilityIssues.length > 0 && (
                        <p className="mt-2 text-xs text-red-600">{job.eligibilityIssues[0]}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        size="sm"
                        variant={job.hasApplied ? "outline" : "default"}
                        disabled={!job.isEligible && !job.hasApplied}
                        className="text-xs"
                      >
                        {job.hasApplied ? "View" : "Details"}
                      </Button>
                    </Link>
                    <span className="text-xs text-neutral-400">{job._count.applications} applied</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
