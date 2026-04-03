import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"
import { randomUUID } from "crypto"

// GET - List all attendance sessions (distinct job+round combos)
export async function GET() {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const sessions = await prisma.attendance.groupBy({
    by: ["jobId", "round"],
    where: { jobId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  // Enrich with job info
  const jobIds = [...new Set(sessions.map((s) => s.jobId).filter(Boolean))] as string[]
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: { id: true, title: true, companyName: true },
  })
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]))

  // Count scanned per session
  const scannedCounts = await prisma.attendance.groupBy({
    by: ["jobId", "round"],
    where: { jobId: { not: null }, scannedAt: { not: null } },
    _count: { id: true },
  })
  const scannedMap = new Map(
    scannedCounts.map((s) => [`${s.jobId}:${s.round}`, s._count.id])
  )

  const result = sessions.map((s) => ({
    jobId: s.jobId,
    round: s.round,
    job: s.jobId ? jobMap[s.jobId] : null,
    total: s._count.id,
    scanned: scannedMap.get(`${s.jobId}:${s.round}`) ?? 0,
  }))

  return NextResponse.json({ success: true, data: result })
}

// POST - Create attendance session: pre-generate records for all shortlisted students
export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const body = await request.json()
  const { jobId, round } = body as { jobId: string; round: string }

  if (!jobId || !round?.trim()) {
    return NextResponse.json(
      { error: "jobId and round are required" },
      { status: 400 }
    )
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, companyName: true },
  })
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  // Check if session already exists
  const existing = await prisma.attendance.findFirst({
    where: { jobId, round: round.trim() },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Session "${round}" already exists for this job` },
      { status: 409 }
    )
  }

  // Get all shortlisted/active applicants for this job
  const applications = await prisma.application.findMany({
    where: {
      jobId,
      isRemoved: false,
      status: {
        in: ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED"],
      },
    },
    select: { userId: true },
  })

  if (applications.length === 0) {
    return NextResponse.json(
      { error: "No eligible applicants found for this job" },
      { status: 400 }
    )
  }

  // Get student USNs
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: applications.map((a) => a.userId) } },
    select: { userId: true, usn: true },
  })
  const usnMap = Object.fromEntries(profiles.map((p) => [p.userId, p.usn]))

  // Bulk create attendance records
  const records = applications.map((app) => ({
    id: randomUUID(),
    studentId: app.userId,
    jobId,
    round: round.trim(),
    qrCode: randomUUID(), // unique token per student+job+round
    createdAt: new Date(),
  }))

  await prisma.attendance.createMany({ data: records })

  logSecurityEvent("attendance_session_created", {
    adminId: session.user.id,
    jobId,
    round,
    studentCount: records.length,
  })

  return NextResponse.json({
    success: true,
    message: `Session created for ${records.length} students`,
    data: { jobId, round: round.trim(), total: records.length },
  })
}
