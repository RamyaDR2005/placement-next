export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
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
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/analytics">
          <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500 hover:text-[#18181B] h-8 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Analytics
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Company-wise Analysis</h1>
        </div>
      </div>

      {/* Batch Filter */}
      {activeBatches.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Batch:</span>
          <Link href="/admin/analytics/companies">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${!batchId ? "bg-[#18181B] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>All</span>
          </Link>
          {activeBatches.map((b) => (
            <Link key={b.id} href={`/admin/analytics/companies?batchId=${b.id}`}>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${batchId === b.id ? "bg-[#18181B] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>{b.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Companies", value: companies.length, sub: "Unique hiring partners" },
          { label: "Total Applications", value: companies.reduce((a, c) => a + c.totalApplications, 0), sub: "Across all companies" },
          { label: "Total Selections", value: companies.reduce((a, c) => a + c.selected, 0), sub: "Offers made" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-[#E8E5E1] bg-white px-4 py-4">
            <p className="text-xs text-zinc-500 font-medium">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-[#18181B] mt-1">{value}</p>
            <p className="text-xs text-zinc-400">{sub}</p>
          </div>
        ))}
      </div>

      <CompanyAnalyticsTable companies={companies} batchId={batchId} />
    </div>
  )
}
