import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

const PACKAGE_BINS = [
  { label: "< 3 LPA", min: 0, max: 3 },
  { label: "3–5 LPA", min: 3, max: 5 },
  { label: "5–7 LPA", min: 5, max: 7 },
  { label: "7–9 LPA", min: 7, max: 9 },
  { label: "9–12 LPA", min: 9, max: 12 },
  { label: "12+ LPA", min: 12, max: Infinity },
]

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const batchId = searchParams.get("batchId")

  // Resolve batchId → admissionYear for profile.batch matching
  let batchAdmissionYear: string | null = null
  if (batchId) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: { admissionYear: true },
    })
    batchAdmissionYear = batch?.admissionYear ?? null
  }

  const userWhere = {
    role: "STUDENT" as const,
    ...(batchId ? { batchId } : {}),
  }

  const [
    totalStudents,
    placementsByTier,
    placementsAll,
    branchGroups,
    applicationsByStatus,
    activeBatches,
  ] = await Promise.all([
    prisma.user.count({ where: userWhere }),

    prisma.placement.groupBy({
      by: ["tier"],
      _count: { tier: true },
      _avg: { salary: true },
      _max: { salary: true },
      ...(batchId
        ? {
            where: {
              user: { batchId },
            },
          }
        : {}),
    }),

    prisma.placement.findMany({
      select: { userId: true, salary: true },
      ...(batchId ? { where: { user: { batchId } } } : {}),
    }),

    prisma.profile.groupBy({
      by: ["branch"],
      where: { branch: { not: null } },
      _count: { branch: true },
    }),

    prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { isRemoved: false },
    }),

    prisma.batch.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
    }),
  ])

  // Placed user IDs (distinct)
  const placedUserIds = new Set(placementsAll.map((p) => p.userId))
  const placedCount = placedUserIds.size
  const placementPct = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0

  const salaries = placementsAll.map((p) => p.salary)
  const avgPackage = salaries.length
    ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 10) / 10
    : 0
  const maxPackage = salaries.length ? Math.max(...salaries) : 0

  // Students with ≥1 offer (SELECTED or OFFER_ACCEPTED)
  const offeredStatuses = ["SELECTED", "OFFER_ACCEPTED"]
  const studentsWithOffer = await prisma.application.groupBy({
    by: ["userId"],
    where: {
      status: { in: offeredStatuses as any },
      isRemoved: false,
      ...(batchId ? { user: { batchId } } : {}),
    },
  })
  const totalOffers = (applicationsByStatus as { status: string; _count: { status: number } }[])
    .filter((s) => offeredStatuses.includes(s.status))
    .reduce((acc, s) => acc + s._count.status, 0)

  // Per-branch placement breakdown
  const byBranch = await Promise.all(
    (branchGroups as { branch: string | null; _count: { branch: number } }[])
      .filter((b) => b.branch)
      .map(async (b) => {
        const placed = await prisma.placement.count({
          where: {
            user: {
              profile: { branch: b.branch as any },
              ...(batchId ? { batchId } : {}),
            },
          },
        })
        return {
          branch: b.branch as string,
          total: b._count.branch,
          placed,
          placementPct: b._count.branch > 0 ? Math.round((placed / b._count.branch) * 100) : 0,
        }
      })
  )

  // Package distribution bins
  const packageBins = await Promise.all(
    PACKAGE_BINS.map(async ({ label, min, max }) => {
      const count = await prisma.placement.count({
        where: {
          salary: { gte: min, ...(max !== Infinity ? { lt: max } : {}) },
          ...(batchId ? { user: { batchId } } : {}),
        },
      })
      return { label, count }
    })
  )

  // Batch comparison (only when multiple active batches)
  let batchComparison = null
  if (activeBatches.length > 1) {
    batchComparison = await Promise.all(
      activeBatches.map(async (b) => {
        const [total, placements] = await Promise.all([
          prisma.user.count({ where: { role: "STUDENT", batchId: b.id } }),
          prisma.placement.findMany({
            where: { user: { batchId: b.id } },
            select: { userId: true, salary: true },
          }),
        ])
        const placedIds = new Set(placements.map((p) => p.userId))
        const batchSalaries = placements.map((p) => p.salary)
        return {
          id: b.id,
          name: b.name,
          totalStudents: total,
          placedCount: placedIds.size,
          placementPct: total > 0 ? Math.round((placedIds.size / total) * 100) : 0,
          avgPackage:
            batchSalaries.length
              ? Math.round((batchSalaries.reduce((a, c) => a + c, 0) / batchSalaries.length) * 10) / 10
              : 0,
        }
      })
    )
  }

  return NextResponse.json({
    totalStudents,
    placedCount,
    placementPct,
    avgPackage,
    maxPackage,
    totalOffers,
    studentsWithOffer: studentsWithOffer.length,
    byBranch: byBranch.sort((a, b) => b.total - a.total),
    byTier: (placementsByTier as { tier: string; _count: { tier: number }; _avg: { salary: number | null } }[]).map((t) => ({
      tier: t.tier,
      count: t._count.tier,
      avgSalary: t._avg.salary ?? 0,
    })),
    packageBins,
    batchComparison,
  })
}
