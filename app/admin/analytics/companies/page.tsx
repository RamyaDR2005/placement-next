export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CompanyAnalyticsTable } from "@/components/admin/company-analytics-table"
import { getActiveBatches } from "@/lib/batch"

export default async function CompanyAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>
}) {
  const { batchId } = await searchParams
  const activeBatches = await getActiveBatches()

  const jobs = await prisma.job.findMany({
    select: {
      id: true,
      companyName: true,
      title: true,
      tier: true,
      minSalary: true,
      maxSalary: true,
      createdAt: true,
      applications: {
        where: {
          isRemoved: false,
          ...(batchId ? { user: { batchId } } : {}),
        },
        select: { status: true, userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Aggregate by company
  const companyMap = new Map<
    string,
    {
      companyName: string
      jobCount: number
      jobIds: string[]
      roles: string[]
      totalApplications: number
      shortlisted: number
      selected: number
      salaries: number[]
      latestDate: Date | null
    }
  >()

  for (const job of jobs) {
    const entry = companyMap.get(job.companyName) ?? {
      companyName: job.companyName,
      jobCount: 0,
      jobIds: [],
      roles: [],
      totalApplications: 0,
      shortlisted: 0,
      selected: 0,
      salaries: [],
      latestDate: null,
    }

    entry.jobCount += 1
    entry.jobIds.push(job.id)
    entry.roles.push(job.title)
    entry.totalApplications += job.applications.length
    entry.shortlisted += job.applications.filter((a) =>
      ["SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED", "OFFER_ACCEPTED"].includes(a.status)
    ).length
    entry.selected += job.applications.filter((a) =>
      ["SELECTED", "OFFER_ACCEPTED"].includes(a.status)
    ).length

    if (job.minSalary) entry.salaries.push(job.minSalary)
    if (job.maxSalary) entry.salaries.push(job.maxSalary)

    if (!entry.latestDate || job.createdAt > entry.latestDate) {
      entry.latestDate = job.createdAt
    }

    companyMap.set(job.companyName, entry)
  }

  const companies = Array.from(companyMap.values())
    .map(({ salaries, latestDate, ...rest }) => ({
      ...rest,
      avgPackage: salaries.length
        ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 10) / 10
        : null,
      latestDate: latestDate?.toISOString() ?? null,
    }))
    .sort((a, b) => b.totalApplications - a.totalApplications)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <Link href="/admin/analytics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Analytics
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Company-wise Analysis</h1>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Batch Filter */}
        {activeBatches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter by batch:</span>
            <Link href="/admin/analytics/companies">
              <Badge variant={!batchId ? "default" : "outline"} className="cursor-pointer">All</Badge>
            </Link>
            {activeBatches.map((b) => (
              <Link key={b.id} href={`/admin/analytics/companies?batchId=${b.id}`}>
                <Badge variant={batchId === b.id ? "default" : "outline"} className="cursor-pointer">{b.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">Unique hiring partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((a, c) => a + c.totalApplications, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all companies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Selections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.reduce((a, c) => a + c.selected, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Offers made</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive table with per-company drawer */}
        <CompanyAnalyticsTable companies={companies} batchId={batchId} />
      </div>
    </div>
  )
}
