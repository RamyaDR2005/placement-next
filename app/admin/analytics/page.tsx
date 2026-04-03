export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, Briefcase, Building, GraduationCap, Users, Award } from "lucide-react"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { getActiveBatches } from "@/lib/batch"

const PACKAGE_BINS = [
  { label: "< 3 LPA", min: 0, max: 3 },
  { label: "3–5 LPA", min: 3, max: 5 },
  { label: "5–7 LPA", min: 5, max: 7 },
  { label: "7–9 LPA", min: 7, max: 9 },
  { label: "9–12 LPA", min: 9, max: 12 },
  { label: "12+ LPA", min: 12, max: Infinity },
]

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>
}) {
  const { batchId } = await searchParams
  const activeBatches = await getActiveBatches()
  const selectedBatch = batchId ? activeBatches.find((b) => b.id === batchId) : null

  const userWhere = {
    role: "STUDENT" as const,
    ...(batchId ? { batchId } : {}),
  }

  const [
    totalStudents,
    placementsAll,
    placementsByTier,
    branchGroups,
    studentsWithOffer,
    totalOffers,
    packageBins,
    byBranch,
    timelineRows,
    batchComparison,
  ] = await Promise.all([
    prisma.user.count({ where: userWhere }),

    prisma.placement.findMany({
      where: batchId ? { user: { batchId } } : {},
      select: { userId: true, salary: true, tier: true },
    }),

    prisma.placement.groupBy({
      by: ["tier"],
      _count: { tier: true },
      _avg: { salary: true },
      ...(batchId ? { where: { user: { batchId } } } : {}),
    }),

    prisma.profile.groupBy({
      by: ["branch"],
      where: { branch: { not: null } },
      _count: { branch: true },
    }),

    prisma.application.groupBy({
      by: ["userId"],
      where: {
        status: { in: ["SELECTED", "OFFER_ACCEPTED"] as any },
        isRemoved: false,
        ...(batchId ? { user: { batchId } } : {}),
      },
    }),

    prisma.application.count({
      where: {
        status: { in: ["SELECTED", "OFFER_ACCEPTED"] as any },
        isRemoved: false,
        ...(batchId ? { user: { batchId } } : {}),
      },
    }),

    Promise.all(
      PACKAGE_BINS.map(async ({ label, min, max }) => {
        const count = await prisma.placement.count({
          where: {
            salary: { gte: min, ...(max !== Infinity ? { lt: max } : {}) },
            ...(batchId ? { user: { batchId } } : {}),
          },
        })
        return { label, count }
      })
    ),

    Promise.all(
      (
        await prisma.profile.groupBy({
          by: ["branch"],
          where: { branch: { not: null } },
          _count: { branch: true },
        })
      ).map(async (b) => {
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
    ),

    // 90-day timeline data for client-side window toggle
    prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', applied_at) AS date, COUNT(*) AS count
      FROM applications
      WHERE applied_at >= NOW() - INTERVAL '90 days' AND is_removed = false
      GROUP BY DATE_TRUNC('day', applied_at)
      ORDER BY date ASC
    `,

    activeBatches.length > 1
      ? Promise.all(
          activeBatches.map(async (b) => {
            const [total, placements] = await Promise.all([
              prisma.user.count({ where: { role: "STUDENT", batchId: b.id } }),
              prisma.placement.findMany({
                where: { user: { batchId: b.id } },
                select: { userId: true, salary: true },
              }),
            ])
            const placedIds = new Set(placements.map((p) => p.userId))
            const sal = placements.map((p) => p.salary)
            return {
              id: b.id,
              name: b.name,
              totalStudents: total,
              placedCount: placedIds.size,
              placementPct: total > 0 ? Math.round((placedIds.size / total) * 100) : 0,
              avgPackage:
                sal.length
                  ? Math.round((sal.reduce((a, c) => a + c, 0) / sal.length) * 10) / 10
                  : 0,
            }
          })
        )
      : Promise.resolve(null),
  ])

  // KPI calculations
  const placedUserIds = new Set(placementsAll.map((p) => p.userId))
  const placedCount = placedUserIds.size
  const placementPct = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0
  const salaries = placementsAll.map((p) => p.salary)
  const avgPackage = salaries.length
    ? Math.round((salaries.reduce((a, b) => a + b, 0) / salaries.length) * 10) / 10
    : 0
  const maxPackage = salaries.length ? Math.max(...salaries) : 0

  // Build full 90-day timeline for client component
  const dateMap = new Map(timelineRows.map((r) => [r.date.toISOString().split("T")[0], Number(r.count)]))
  const timelineData = Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    const key = d.toISOString().split("T")[0]
    return { date: key, count: dateMap.get(key) ?? 0 }
  })

  const tierData = (placementsByTier as { tier: string; _count: { tier: number }; _avg: { salary: number | null } }[]).map(
    (t) => ({ tier: t.tier, count: t._count.tier, avgSalary: t._avg.salary ?? 0 })
  )

  const kpiCards = [
    { label: "Total Students", value: totalStudents, sub: batchId ? selectedBatch?.name : "All batches", icon: Users },
    { label: "Placement %", value: `${placementPct}%`, sub: `${placedCount} placed`, icon: TrendingUp },
    { label: "Avg Package", value: `${avgPackage} LPA`, sub: `Max: ${maxPackage} LPA`, icon: Award },
    { label: "Total Offers", value: totalOffers, sub: `${studentsWithOffer.length} students`, icon: Briefcase },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <Link href="/admin/analytics/companies">
          <Button variant="outline" size="sm">
            <Building className="w-4 h-4 mr-2" />
            Company-wise Analysis
          </Button>
        </Link>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Batch Filter */}
        {activeBatches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filter by batch:</span>
            <Link href="/admin/analytics">
              <Badge variant={!batchId ? "default" : "outline"} className="cursor-pointer">All Batches</Badge>
            </Link>
            {activeBatches.map((b) => (
              <Link key={b.id} href={`/admin/analytics?batchId=${b.id}`}>
                <Badge variant={batchId === b.id ? "default" : "outline"} className="cursor-pointer">{b.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map(({ label, value, sub, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tier Breakdown */}
        {tierData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            {(["DREAM", "TIER_1", "TIER_2", "TIER_3"] as const).map((tier) => {
              const stat = tierData.find((t) => t.tier === tier)
              const labels = { DREAM: "Dream", TIER_1: "Tier 1", TIER_2: "Tier 2", TIER_3: "Tier 3" }
              const ranges = { DREAM: "> ₹10 LPA", TIER_1: "> ₹9 LPA", TIER_2: "₹5–9 LPA", TIER_3: "≤ ₹5 LPA" }
              return (
                <Card key={tier}>
                  <CardContent className="pt-4 pb-4 flex flex-col items-center">
                    <Badge variant={tier === "DREAM" ? "destructive" : tier === "TIER_1" ? "default" : "secondary"}>
                      {labels[tier]}
                    </Badge>
                    <div className="text-3xl font-bold mt-2">{stat?.count ?? 0}</div>
                    <p className="text-xs text-muted-foreground">{ranges[tier]}</p>
                    {stat?.avgSalary ? (
                      <p className="text-xs text-muted-foreground">Avg {stat.avgSalary.toFixed(1)} LPA</p>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Charts — client component */}
        <AnalyticsCharts
          byBranch={byBranch.sort((a, b) => b.total - a.total)}
          byTier={tierData}
          packageBins={packageBins}
          timelineData={timelineData}
          batchComparison={batchComparison}
        />
      </div>
    </div>
  )
}
