"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Activity,
  Building2,
  Briefcase,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Bell,
  Eye
} from "lucide-react"
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
  Area,
  AreaChart
} from "recharts"
import Link from "next/link"

interface DashboardOverview {
  totalStudents: number
  verifiedStudents: number
  pendingVerifications: number
  totalRecruiters: number
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
  user: {
    name: string | null
    email: string | null
  }
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
  user: {
    name: string
    email: string
  }
}

interface AdminDashboardViewProps {
  data: AdminDashboardData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

const TIER_COLORS: Record<string, string> = {
  TIER_1: '#22c55e',
  TIER_2: '#3b82f6',
  TIER_3: '#f59e0b',
  DREAM: '#8b5cf6',
}

const TIER_LABELS: Record<string, string> = {
  TIER_1: 'Tier 1 (>9 LPA)',
  TIER_2: 'Tier 2 (5-9 LPA)',
  TIER_3: 'Tier 3 (<=5 LPA)',
  DREAM: 'Dream (>10 LPA)',
}

export function AdminDashboardView({ data }: AdminDashboardViewProps) {
  const { overview, batchStats, siteSettings, activities, stats, user } = data

  // Format monthly trends data
  const monthlyData = stats.monthlyTrends.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    students: Number(item.count)
  }))

  // Format branch data for charts
  const branchData = stats.branchWiseStats
    .filter(item => item.branch !== null)
    .map(item => ({
      branch: item.branch,
      count: item._count.branch
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate completion rate
  const completionRate = overview.totalStudents > 0
    ? Math.round((overview.verifiedStudents / overview.totalStudents) * 100)
    : 0

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/kyc-queue">
              <UserCheck className="h-4 w-4 mr-2" />
              KYC Queue
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Announcement Banner */}
        {siteSettings.announcementActive && siteSettings.announcementText && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                {siteSettings.announcementText}
              </p>
            </div>
          </div>
        )}

        {/* Current Season Stats */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{siteSettings.placementSeasonName}</CardTitle>
                <CardDescription>Batch: {siteSettings.activeBatch} {!siteSettings.registrationOpen && " | Registration Closed"}</CardDescription>
              </div>
              <Badge variant={siteSettings.registrationOpen ? "default" : "secondary"}>
                {siteSettings.registrationOpen ? "Registration Open" : "Registration Closed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Batch Students</p>
                <p className="text-2xl font-bold">{batchStats.batchStudents}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Placed</p>
                <p className="text-2xl font-bold">{batchStats.batchPlacedStudents}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Package</p>
                <p className="text-2xl font-bold">{batchStats.avgPackage > 0 ? `${batchStats.avgPackage.toFixed(2)} LPA` : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-2xl font-bold">{batchStats.placementRate}%</p>
              </div>
            </div>
            {batchStats.tierDistribution.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {batchStats.tierDistribution.map((t) => (
                  <Badge
                    key={t.tier}
                    variant="outline"
                    style={{ borderColor: TIER_COLORS[t.tier] || '#6b7280' }}
                  >
                    {TIER_LABELS[t.tier] || t.tier}: {t.count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All-Time Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Students</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.verifiedStudents}</div>
              <p className="text-xs text-muted-foreground">
                KYC verified profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting KYC review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.activeJobPostings}</div>
              <p className="text-xs text-muted-foreground">
                Open job postings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recruiters</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalRecruiters}</div>
              <p className="text-xs text-muted-foreground">
                Registered companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Total job applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placed Students</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.placedStudents}</div>
              <p className="text-xs text-muted-foreground">
                Successfully placed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.upcomingInterviews}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly Trends Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student Registration Trends</CardTitle>
              <CardDescription>Monthly student registrations over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest profile updates and verifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {activity.kycStatus === 'VERIFIED' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.kycStatus === 'PENDING' ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {activity.firstName && activity.lastName
                        ? `${activity.firstName} ${activity.lastName}`
                        : activity.user.name || 'Anonymous User'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Profile updated • {new Date(activity.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={activity.kycStatus === 'VERIFIED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.kycStatus}
                  </Badge>
                </div>
              ))}
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/admin/students">
                  <Eye className="h-4 w-4" />
                  View All Students
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Branch Distribution and System Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Branch Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Distribution</CardTitle>
              <CardDescription>Student distribution across engineering branches</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="branch" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Status and Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and quick actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Profile Completion Rate</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/admin/kyc-queue">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Review KYC Submissions
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/admin/notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notifications
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/admin/schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Events
                  </Link>
                </Button>

                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
