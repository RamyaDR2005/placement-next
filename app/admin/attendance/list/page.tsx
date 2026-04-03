import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AttendanceListView } from "@/components/admin/attendance-list-view"

export default async function AttendanceListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) redirect("/dashboard")

  // Get filter options
  const jobs = await prisma.job.findMany({
    where: { applications: { some: {} } },
    select: { id: true, title: true, companyName: true },
    orderBy: { companyName: "asc" },
  })

  const rounds = await prisma.attendance.findMany({
    where: { round: { not: null } },
    select: { round: true },
    distinct: ["round"],
    orderBy: { round: "asc" },
  })

  return (
    <AttendanceListView
      jobs={jobs}
      rounds={rounds.map((r) => r.round!).filter(Boolean)}
    />
  )
}
