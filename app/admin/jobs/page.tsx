export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Job } from "@prisma/client"
import { JobsFilterBar } from "@/components/admin/jobs-filter-bar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Job Management | Admin",
  description: "Manage job postings and applications",
}

type JobWithCount = Job & { _count: { applications: number } }

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  ACTIVE:    { label: "Active",    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  DRAFT:     { label: "Draft",     badge: "bg-amber-50 text-amber-700 ring-amber-100" },
  CLOSED:    { label: "Closed",    badge: "bg-zinc-100 text-zinc-500 ring-zinc-100" },
  CANCELLED: { label: "Cancelled", badge: "bg-red-50 text-red-600 ring-red-100" },
}

const TIER_CONFIG: Record<string, { label: string; badge: string }> = {
  DREAM:  { label: "Dream",  badge: "bg-violet-50 text-violet-700 ring-violet-100" },
  TIER_1: { label: "Tier 1", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  TIER_2: { label: "Tier 2", badge: "bg-blue-50 text-blue-700 ring-blue-100" },
  TIER_3: { label: "Tier 3", badge: "bg-amber-50 text-amber-700 ring-amber-100" },
}

export default async function JobManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; tier?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const status = params.status
  const tier = params.tier
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const PAGE_SIZE = 15

  const where: Prisma.JobWhereInput = {
    ...(q
      ? { OR: [
          { title: { contains: q, mode: "insensitive" } },
          { companyName: { contains: q, mode: "insensitive" } },
        ] }
      : {}),
    ...(status ? { status: status as any } : {}),
    ...(tier ? { tier: tier as any } : {}),
  }

  const [totalJobs, activeJobs, draftJobs, totalApplications, totalFiltered, jobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.application.count(),
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { _count: { select: { applications: true } } },
    }),
  ])

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)

  return (
    <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
            Job Management
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Create and manage job postings for students</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="bg-[#18181B] hover:bg-zinc-800 text-white h-9 text-sm gap-1.5">
            <Plus className="h-4 w-4" /> Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Jobs", value: totalJobs, color: "text-[#18181B]" },
          { label: "Active", value: activeJobs, color: "text-emerald-600" },
          { label: "Draft", value: draftJobs, color: "text-amber-600" },
          { label: "Applications", value: totalApplications, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-[#E8E5E1] bg-white px-4 py-4">
            <p className="text-xs text-zinc-500 font-medium">{label}</p>
            <p className={cn("text-2xl font-bold tracking-tight mt-1", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <JobsFilterBar filters={{ q, status: status ?? "", tier: tier ?? "" }} totalFiltered={totalFiltered} />

      {/* Job list */}
      <div className="rounded-2xl border border-[#E8E5E1] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E5E1]">
          <p className="text-sm font-medium text-[#18181B]">
            {q || status || tier ? `Filtered results (${totalFiltered})` : `All job postings (${totalJobs})`}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500 mb-4">
              {q || status || tier ? "No jobs match the current filters." : "No jobs posted yet."}
            </p>
            <Link href="/admin/jobs/new">
              <Button className="bg-[#18181B] text-white hover:bg-zinc-800 h-9 text-sm gap-1.5">
                <Plus className="h-4 w-4" /> Post Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE8]">
            {(jobs as JobWithCount[]).map((job) => {
              const statusCfg = STATUS_CONFIG[job.status]
              const tierCfg = TIER_CONFIG[job.tier] ?? TIER_CONFIG.TIER_3
              return (
                <div key={job.id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#18181B]">{job.title}</span>
                      {statusCfg && (
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide",
                          statusCfg.badge
                        )}>
                          {statusCfg.label}
                        </span>
                      )}
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide",
                        tierCfg.badge
                      )}>
                        {tierCfg.label}
                      </span>
                      {!job.isVisible && (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-zinc-500">
                      <span>{job.companyName}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                      <span>·</span>
                      <span>{job._count.applications} applications</span>
                      {job.deadline && (
                        <><span>·</span><span>Due {format(new Date(job.deadline), "d MMM yyyy")}</span></>
                      )}
                      {job.salary && (
                        <><span>·</span><span className="font-medium text-zinc-700">{job.salary} LPA</span></>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/admin/jobs/${job.id}/applicants`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-[#E8E5E1] hover:bg-zinc-50">
                        Applicants
                      </Button>
                    </Link>
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs border-[#E8E5E1] hover:bg-zinc-50">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-1.5">
            {page > 1 && (
              <Link href={`/admin/jobs?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(tier ? { tier } : {}), page: String(page - 1) })}`}>
                <Button variant="outline" size="sm" className="h-8 border-[#E8E5E1] text-xs">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/jobs?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(tier ? { tier } : {}), page: String(page + 1) })}`}>
                <Button variant="outline" size="sm" className="h-8 border-[#E8E5E1] text-xs">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
