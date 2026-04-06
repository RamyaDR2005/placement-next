"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  UserCheck,
  Clock,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarDays,
  ArrowRight,
  Radio,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"

interface DashboardOverview {
  totalStudents: number
  verifiedStudents: number
  pendingVerifications: number
  activeJobPostings: number
  totalApplications: number
  placedStudents: number
  upcomingInterviews: number
}

interface BatchStats {
  batchStudents: number
  batchPlacedStudents: number
  avgPackage: number
  placementRate: number
  tierDistribution: { tier: string; count: number }[]
}

interface SiteSettingsData {
  placementSeasonName: string
  activeBatch: string
  announcementText: string | null
  announcementActive: boolean
  registrationOpen: boolean
}

interface DashboardActivity {
  id: string
  firstName: string | null
  lastName: string | null
  user: { name: string | null; email: string | null }
  updatedAt: Date
  kycStatus: string
}

interface DashboardStats {
  placementStats: { branch: string | null; _count: { branch: number } }[]
  branchWiseStats: { branch: string | null; _count: { branch: number } }[]
  monthlyTrends: { month: Date; count: bigint }[]
}

interface AdminDashboardData {
  overview: DashboardOverview
  batchStats: BatchStats
  siteSettings: SiteSettingsData
  activities: DashboardActivity[]
  stats: DashboardStats
  user: { name: string; email: string }
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DREAM:  { label: "Dream",  color: "text-violet-600", bg: "bg-violet-50" },
  TIER_1: { label: "Tier 1", color: "text-emerald-600", bg: "bg-emerald-50" },
  TIER_2: { label: "Tier 2", color: "text-blue-600",    bg: "bg-blue-50" },
  TIER_3: { label: "Tier 3", color: "text-amber-600",   bg: "bg-amber-50" },
}

const quickActions = [
  { label: "Review KYC",       href: "/admin/students/kyc",  icon: UserCheck,   desc: "Pending verifications" },
  { label: "Post a Job",       href: "/admin/jobs/new",       icon: Briefcase,   desc: "Create new posting" },
  { label: "Send Alert",       href: "/admin/notifications",  icon: Radio,       desc: "Notify students" },
  { label: "Schedule Event",   href: "/admin/schedule",       icon: CalendarDays, desc: "Add drive / test" },
  { label: "Record Placement", href: "/admin/placements",     icon: CheckCircle2, desc: "Log an offer" },
  { label: "Export Data",      href: "/admin/backup",         icon: FileText,    desc: "Backup & export" },
]

export function AdminDashboardView({ data }: { data: AdminDashboardData }) {
  const { overview, batchStats, siteSettings, activities, stats, user } = data

  const monthlyData = stats.monthlyTrends.map((item) => ({
    month: new Date(item.month).toLocaleDateString("en-IN", { month: "short" }),
    students: Number(item.count),
  }))

  const kycRate = overview.totalStudents > 0
    ? Math.round((overview.verifiedStudents / overview.totalStudents) * 100)
    : 0

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="min-h-full bg-zinc-50/50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            {greeting}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">{siteSettings.placementSeasonName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={siteSettings.registrationOpen ? "default" : "secondary"}
            className={siteSettings.registrationOpen
              ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-zinc-100 text-zinc-500"
            }
          >
            <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${siteSettings.registrationOpen ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {siteSettings.registrationOpen ? "Applications Open" : "Applications Closed"}
          </Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
            <Link href="/admin/analytics">
              View Analytics <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">

        {/* Announcement */}
        {siteSettings.announcementActive && siteSettings.announcementText && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">{siteSettings.announcementText}</p>
          </div>
        )}

        {/* Season summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Placement Rate",
              value: `${batchStats.placementRate}%`,
              sub: `${batchStats.batchPlacedStudents} of ${batchStats.batchStudents} students`,
              accent: "border-l-emerald-500",
              valueColor: "text-emerald-600",
            },
            {
              label: "Avg Package",
              value: batchStats.avgPackage > 0 ? `${batchStats.avgPackage.toFixed(1)} LPA` : "—",
              sub: "Current batch",
              accent: "border-l-blue-500",
              valueColor: "text-blue-600",
            },
            {
              label: "Active Jobs",
              value: String(overview.activeJobPostings),
              sub: "Open for applications",
              accent: "border-l-violet-500",
              valueColor: "text-violet-600",
            },
            {
              label: "Pending KYC",
              value: String(overview.pendingVerifications),
              sub: "Awaiting review",
              accent: overview.pendingVerifications > 0 ? "border-l-amber-500" : "border-l-zinc-300",
              valueColor: overview.pendingVerifications > 0 ? "text-amber-600" : "text-zinc-600",
            },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl border border-zinc-100 border-l-4 ${s.accent} px-4 py-4 shadow-sm`}>
              <p className="text-xs text-zinc-500 font-medium mb-1">{s.label}</p>
              <p className={`text-2xl font-bold tracking-tight ${s.valueColor}`}>{s.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tier breakdown */}
        {batchStats.tierDistribution.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {batchStats.tierDistribution.map((t) => {
              const cfg = TIER_CONFIG[t.tier]
              if (!cfg) return null
              return (
                <span
                  key={t.tier}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.label} — {t.count} placed
                </span>
              )
            })}
          </div>
        )}

        {/* Main content: chart + activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800">Student Registrations</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-2xl font-bold text-zinc-900">{overview.totalStudents}</span>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    cursor={{ stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 2" }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} fill="url(#grad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-zinc-400">No data yet</div>
            )}

            {/* Mini stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-50">
              {[
                { label: "Total Students", value: overview.totalStudents },
                { label: "Applications", value: overview.totalApplications },
                { label: "Placed", value: overview.placedStudents },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-zinc-900">{s.value}</p>
                  <p className="text-xs text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-800">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-400 px-2" asChild>
                <Link href="/admin/students">View all</Link>
              </Button>
            </div>

            {/* KYC progress */}
            <div className="mb-4 pb-4 border-b border-zinc-50">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>KYC verified</span>
                <span className="font-medium text-zinc-700">{overview.verifiedStudents} / {overview.totalStudents}</span>
              </div>
              <Progress value={kycRate} className="h-1.5 bg-zinc-100" />
              <p className="text-xs text-zinc-400 mt-1">{kycRate}% of students verified</p>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((a) => {
                const name = a.firstName && a.lastName
                  ? `${a.firstName} ${a.lastName}`
                  : a.user.name || "Student"
                const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                const statusColor =
                  a.kycStatus === "VERIFIED" ? "text-emerald-600 bg-emerald-50"
                  : a.kycStatus === "PENDING" ? "text-amber-600 bg-amber-50"
                  : "text-red-500 bg-red-50"
                return (
                  <div key={a.id} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-800 truncate font-medium leading-tight">{name}</p>
                      <p className="text-xs text-zinc-400 leading-tight">
                        {new Date(a.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${statusColor}`}>
                      {a.kycStatus === "VERIFIED" ? "OK" : a.kycStatus === "PENDING" ? "Pending" : "Rejected"}
                    </span>
                  </div>
                )
              })}
            </div>

            {overview.pendingVerifications > 0 && (
              <Button className="w-full mt-4 h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white" asChild>
                <Link href="/admin/students/kyc">
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  {overview.pendingVerifications} pending — Review now
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group bg-white rounded-xl border border-zinc-100 shadow-sm p-4 hover:border-zinc-300 hover:shadow-md transition-all duration-150 flex flex-col gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-zinc-50 group-hover:bg-zinc-100 flex items-center justify-center transition-colors">
                  <action.icon className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800 leading-tight">{action.label}</p>
                  <p className="text-xs text-zinc-400 leading-tight mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming events note */}
        {overview.upcomingInterviews > 0 && (
          <Link href="/admin/schedule" className="flex items-center justify-between bg-white rounded-xl border border-zinc-100 shadow-sm px-5 py-4 hover:border-zinc-200 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {overview.upcomingInterviews} event{overview.upcomingInterviews !== 1 ? "s" : ""} in the next 7 days
                </p>
                <p className="text-xs text-zinc-400">Placement drives, interviews & tests</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  )
}
