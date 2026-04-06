export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { StudentsFilterTable } from "@/components/admin/students-filter-table"
import { getActiveBatches } from "@/lib/batch"

const PAGE_SIZE = 20

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    kycStatus?: string
    branch?: string
    batchId?: string
    placed?: string
    page?: string
  }>
}) {
  const session = await auth()
  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const kycStatus = params.kycStatus
  const branch = params.branch
  const batchId = params.batchId
  const placed = params.placed // "yes" | "no"
  const page = Math.max(1, parseInt(params.page ?? "1", 10))

  const [activeBatches, branches] = await Promise.all([
    getActiveBatches(),
    prisma.profile.findMany({
      where: { branch: { not: null } },
      distinct: ["branch"],
      select: { branch: true },
      orderBy: { branch: "asc" },
    }),
  ])

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(batchId ? { batchId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { profile: { usn: { contains: q, mode: "insensitive" } } },
            { profile: { firstName: { contains: q, mode: "insensitive" } } },
            { profile: { lastName: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(kycStatus ? { profile: { kycStatus: kycStatus as any } } : {}),
    ...(branch ? { profile: { branch: branch as any } } : {}),
  }

  const [totalCount, students] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isComplete: true,
            completionStep: true,
            kycStatus: true,
            usn: true,
            branch: true,
            batch: true,
            phone: true,
            callingMobile: true,
            finalCgpa: true,
            cgpa: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        placements: { select: { id: true, tier: true, companyName: true, salary: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  // If filtering by placed status, we need to post-filter (simpler than complex join)
  // For placed filter we re-fetch all and filter in memory for accuracy
  let filteredStudents = students
  if (placed === "yes" || placed === "no") {
    const allStudents = await prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isComplete: true,
            completionStep: true,
            kycStatus: true,
            usn: true,
            branch: true,
            batch: true,
            phone: true,
            callingMobile: true,
            finalCgpa: true,
            cgpa: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        placements: { select: { id: true, tier: true, companyName: true, salary: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    filteredStudents = allStudents.filter((s) =>
      placed === "yes" ? s.placements.length > 0 : s.placements.length === 0
    ).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const exportUrl = `/api/admin/students/export?${new URLSearchParams({
    ...(q ? { q } : {}),
    ...(kycStatus ? { kycStatus } : {}),
    ...(branch ? { branch } : {}),
    ...(batchId ? { batchId } : {}),
    ...(placed ? { placed } : {}),
  }).toString()}`

  return (
    <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Student Management</h1>
        <p className="mt-1 text-sm text-zinc-500">View, filter, and verify student profiles</p>
      </div>
      <div>
        <StudentsFilterTable
          students={filteredStudents as any}
          adminId={session!.user.id}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={page}
          activeBatches={activeBatches}
          branches={branches.map((b) => b.branch as string)}
          exportUrl={exportUrl}
          filters={{ q, kycStatus: kycStatus ?? "", branch: branch ?? "", batchId: batchId ?? "", placed: placed ?? "" }}
        />
      </div>
    </div>
  )
}
