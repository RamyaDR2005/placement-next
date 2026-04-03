import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const batchId = searchParams.get("batchId")

  const userFilter = batchId ? { batchId } : {}

  // Get all jobs with their application aggregates
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
        where: { isRemoved: false, ...(batchId ? { user: userFilter } : {}) },
        select: { status: true, userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Group by company name
  const companyMap = new Map<
    string,
    {
      companyName: string
      jobCount: number
      jobIds: string[]
      totalApplications: number
      shortlisted: number
      selected: number
      salaries: number[]
      latestDate: Date | null
    }
  >()

  for (const job of jobs) {
    const existing = companyMap.get(job.companyName) ?? {
      companyName: job.companyName,
      jobCount: 0,
      jobIds: [],
      totalApplications: 0,
      shortlisted: 0,
      selected: 0,
      salaries: [],
      latestDate: null,
    }

    existing.jobCount += 1
    existing.jobIds.push(job.id)
    existing.totalApplications += job.applications.length
    existing.shortlisted += job.applications.filter((a) =>
      ["SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED", "OFFER_ACCEPTED"].includes(a.status)
    ).length
    existing.selected += job.applications.filter((a) =>
      ["SELECTED", "OFFER_ACCEPTED"].includes(a.status)
    ).length

    if (job.minSalary) existing.salaries.push(job.minSalary)
    if (job.maxSalary) existing.salaries.push(job.maxSalary)

    if (!existing.latestDate || job.createdAt > existing.latestDate) {
      existing.latestDate = job.createdAt
    }

    companyMap.set(job.companyName, existing)
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

  return NextResponse.json({ companies })
}
