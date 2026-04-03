"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BranchRow { branch: string; total: number; placed: number; placementPct: number }
interface TierRow { tier: string; count: number; avgSalary: number }
interface BinRow { label: string; count: number }
interface TimelineRow { date: string; count: number }
interface BatchRow { id: string; name: string; totalStudents: number; placedCount: number; placementPct: number; avgPackage: number }

interface AnalyticsChartsProps {
  byBranch: BranchRow[]
  byTier: TierRow[]
  packageBins: BinRow[]
  timelineData: TimelineRow[]
  batchComparison: BatchRow[] | null
}

const TIER_COLORS: Record<string, string> = {
  DREAM: "#8b5cf6",
  TIER_1: "#10b981",
  TIER_2: "#3b82f6",
  TIER_3: "#f59e0b",
}

const TIER_LABELS: Record<string, string> = {
  DREAM: "Dream (>10 LPA)",
  TIER_1: "Tier 1 (>9 LPA)",
  TIER_2: "Tier 2 (5–9 LPA)",
  TIER_3: "Tier 3 (≤5 LPA)",
}

const DAY_OPTIONS = [30, 60, 90] as const

export function AnalyticsCharts({
  byBranch,
  byTier,
  packageBins,
  timelineData,
  batchComparison,
}: AnalyticsChartsProps) {
  const [timelineDays, setTimelineDays] = useState<30 | 60 | 90>(30)

  // Slice timeline data to the selected window
  const visibleTimeline = timelineData.slice(-timelineDays)

  return (
    <div className="space-y-6">
      {/* Branch Placement Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Placement by Branch</CardTitle>
          <CardDescription>Number of students placed vs total per branch</CardDescription>
        </CardHeader>
        <CardContent>
          {byBranch.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No branch data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byBranch} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) =>
                    [value, name === "placed" ? "Placed" : "Total Students"]
                  }
                />
                <Legend formatter={(v) => (v === "placed" ? "Placed" : "Total Students")} />
                <Bar dataKey="total" fill="#e2e8f0" name="total" radius={[3, 3, 0, 0]} />
                <Bar dataKey="placed" fill="#10b981" name="placed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier-wise Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Placements by Tier</CardTitle>
            <CardDescription>Distribution across salary tiers</CardDescription>
          </CardHeader>
          <CardContent>
            {byTier.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No placement data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={byTier.map((t) => ({ ...t, name: t.tier }))}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={false}
                    labelLine={false}
                  >
                    {byTier.map((entry) => (
                      <Cell key={entry.tier} fill={TIER_COLORS[entry.tier] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, TIER_LABELS[String(name)] ?? name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Package Distribution Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
            <CardDescription>Students placed in each salary bracket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={packageBins} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [v, "Students"]} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>Daily application submissions over time</CardDescription>
            </div>
            <div className="flex gap-1">
              {DAY_OPTIONS.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={timelineDays === d ? "default" : "outline"}
                  onClick={() => setTimelineDays(d)}
                >
                  {d}d
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={visibleTimeline} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }}
                interval={Math.floor(visibleTimeline.length / 8)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                formatter={(v) => [v, "Applications"]}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Batch Comparison (only when 2 active batches) */}
      {batchComparison && batchComparison.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Comparison</CardTitle>
            <CardDescription>Side-by-side metrics for active batches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 grid-cols-${batchComparison.length}`}>
              {batchComparison.map((b) => (
                <div key={b.id} className="rounded-lg border p-5 space-y-4">
                  <h3 className="font-semibold text-sm">{b.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Students</span>
                      <span className="font-medium">{b.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placed</span>
                      <span className="font-medium">{b.placedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placement %</span>
                      <span className="font-semibold text-green-600">{b.placementPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Package</span>
                      <span className="font-medium">{b.avgPackage} LPA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
