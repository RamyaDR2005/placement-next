import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminAttendanceView } from "@/components/admin/attendance-view"

export default async function AdminAttendancePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/dashboard")
  }

  // Jobs that have active/shortlisted applicants
  const jobs = await prisma.job.findMany({
    where: {
      applications: {
        some: {
          isRemoved: false,
          status: { in: ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED"] },
        },
      },
    },
    select: { id: true, title: true, companyName: true },
    orderBy: { createdAt: "desc" },
  })

  // Existing sessions
  const existingSessions = await prisma.attendance.groupBy({
    by: ["jobId", "round"],
    where: { jobId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const sessionJobIds = [...new Set(existingSessions.map((s) => s.jobId).filter(Boolean))] as string[]
  const sessionJobs = await prisma.job.findMany({
    where: { id: { in: sessionJobIds } },
    select: { id: true, companyName: true, title: true },
  })
  const sessionJobMap = Object.fromEntries(sessionJobs.map((j) => [j.id, j]))

  const scannedCounts = await prisma.attendance.groupBy({
    by: ["jobId", "round"],
    where: { jobId: { not: null }, scannedAt: { not: null } },
    _count: { id: true },
  })
  const scannedMap = new Map(scannedCounts.map((s) => [`${s.jobId}:${s.round}`, s._count.id]))

  const sessions = existingSessions.map((s) => ({
    jobId: s.jobId ?? "",
    round: s.round ?? "",
    job: s.jobId ? sessionJobMap[s.jobId] : null,
    total: s._count.id,
    scanned: scannedMap.get(`${s.jobId}:${s.round}`) ?? 0,
  }))

  return <AdminAttendanceView jobs={jobs} sessions={sessions} />
}
