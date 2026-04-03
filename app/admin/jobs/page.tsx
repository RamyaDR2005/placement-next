import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Job } from "@prisma/client"
import { JobsFilterBar } from "@/components/admin/jobs-filter-bar"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Job Management | Admin",
  description: "Manage job postings and applications",
}

type JobWithCount = Job & { _count: { applications: number } }

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  CLOSED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const TIER_LABELS: Record<string, string> = {
  DREAM: "Dream",
  TIER_1: "Tier 1",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
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
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { companyName: { contains: q, mode: "insensitive" } },
          ],
        }
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage job postings for students</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Jobs", value: totalJobs },
          { label: "Active Jobs", value: activeJobs, color: "text-green-600" },
          { label: "Draft Jobs", value: draftJobs, color: "text-yellow-600" },
          { label: "Total Applications", value: totalApplications },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color ?? ""}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <JobsFilterBar filters={{ q, status: status ?? "", tier: tier ?? "" }} totalFiltered={totalFiltered} />

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {q || status || tier ? `Filtered Results (${totalFiltered})` : "All Job Postings"}
          </CardTitle>
          <CardDescription>Click a job to view applicants or edit</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {q || status || tier ? "No jobs match the current filters." : "No jobs posted yet."}
              </p>
              <Link href="/admin/jobs/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(jobs as JobWithCount[]).map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <Badge className={STATUS_COLORS[job.status]}>{job.status}</Badge>
                        <Badge variant="outline">{TIER_LABELS[job.tier] ?? job.tier}</Badge>
                        {!job.isVisible && <Badge variant="outline">Hidden</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{job.companyName}</span>
                        <span>·</span>
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{job._count.applications} applications</span>
                        {job.deadline && (
                          <>
                            <span>·</span>
                            <span>Due {format(new Date(job.deadline), "d MMM yyyy")}</span>
                          </>
                        )}
                        {job.salary && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-foreground">{job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/admin/jobs/${job.id}/applicants`}>
                        <Button variant="outline" size="sm">Applicants</Button>
                      </Link>
                      <Link href={`/admin/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link href={`/admin/jobs?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(tier ? { tier } : {}), page: String(page - 1) })}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/admin/jobs?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(tier ? { tier } : {}), page: String(page + 1) })}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
