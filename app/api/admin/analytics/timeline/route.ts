import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = request.nextUrl
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 90)
  const batchId = searchParams.get("batchId")

  const since = new Date()
  since.setDate(since.getDate() - days)

  const rows = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT
      DATE_TRUNC('day', a.applied_at) AS date,
      COUNT(*) AS count
    FROM applications a
    ${batchId
      ? prisma.$queryRaw`JOIN users u ON u.id = a.user_id WHERE u.batch_id = ${batchId} AND`
      : prisma.$queryRaw`WHERE`
    }
      a.applied_at >= ${since}
      AND a.is_removed = false
    GROUP BY DATE_TRUNC('day', a.applied_at)
    ORDER BY date ASC
  `

  // Build a complete day-by-day series (fill gaps with 0)
  const dataMap = new Map(
    rows.map((r) => [r.date.toISOString().split("T")[0], Number(r.count)])
  )
  const series: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    series.push({ date: key, count: dataMap.get(key) ?? 0 })
  }

  return NextResponse.json({ days, data: series })
}
