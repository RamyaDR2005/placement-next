import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId") || undefined
  const round = searchParams.get("round") || undefined
  const scannedOnly = searchParams.get("scannedOnly") === "true"
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = 50

  const where = {
    ...(jobId && { jobId }),
    ...(round && { round }),
    ...(scannedOnly && { scannedAt: { not: null } }),
  }

  const [total, records] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  const studentIds = [...new Set(records.map((r) => r.studentId))]
  const jobIds = [...new Set(records.map((r) => r.jobId).filter(Boolean))] as string[]

  const [profiles, jobs] = await Promise.all([
    prisma.profile.findMany({
      where: { userId: { in: studentIds } },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.job.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, title: true, companyName: true },
    }),
  ])

  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]))
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]))

  const enriched = records.map((r) => {
    const profile = profileMap[r.studentId]
    const job = r.jobId ? jobMap[r.jobId] : null
    return {
      id: r.id,
      round: r.round,
      scannedAt: r.scannedAt,
      location: r.location,
      createdAt: r.createdAt,
      student: profile
        ? {
            name: profile.user?.name || `${profile.firstName} ${profile.lastName}`,
            usn: profile.usn,
            branch: profile.branch,
          }
        : { name: "Unknown", usn: null, branch: null },
      job: job ? { title: job.title, company: job.companyName } : null,
    }
  })

  return NextResponse.json({
    success: true,
    data: enriched,
    meta: { total, page, limit },
  })
}
