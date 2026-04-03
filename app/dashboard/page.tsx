import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { checkYearAccess } from "@/lib/year-gate"
import { getSiteSettings } from "@/lib/settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const yearAccess = await checkYearAccess(session)
  if (!yearAccess.authorized) {
    redirect("/not-authorized")
  }

  const siteSettings = await getSiteSettings()

  // Get user with profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user) {
    redirect("/login")
  }

  const isAdmin = user.role === 'ADMIN'

  // Fetch dashboard statistics
  const [
    totalJobs,
    activeJobs,
    myApplications,
    upcomingEvents,
    totalStudents,
    verifiedProfiles,
    recentJobs,
    upcomingEventsList,
    placementJourney,
  ] = await Promise.all([
    prisma.job.count().catch(() => 0),
    prisma.job.count({
      where: { status: 'ACTIVE', isVisible: true }
    }).catch(() => 0),
    isAdmin ? Promise.resolve(null) : prisma.application.count({
      where: { userId: session.user.id }
    }).catch(() => 0),
    prisma.scheduleEvent.count({
      where: {
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'ONGOING'] },
        isVisible: true
      }
    }).catch(() => 0),
    isAdmin ? prisma.user.count({ where: { role: 'STUDENT' } }).catch(() => 0) : Promise.resolve(null),
    isAdmin ? prisma.profile.count({ where: { kycStatus: 'VERIFIED' } }).catch(() => 0) : Promise.resolve(null),
    // Recent active jobs for the "Recent Job Openings" card
    prisma.job.findMany({
      where: { status: 'ACTIVE', isVisible: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        title: true,
        companyName: true,
        salary: true,
        tier: true,
        deadline: true,
      }
    }).catch(() => []),
    // Upcoming events
    prisma.scheduleEvent.findMany({
      where: {
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'ONGOING'] },
        isVisible: true,
      },
      orderBy: { date: 'asc' },
      take: 4,
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        type: true,
      }
    }).catch(() => []),
    // Placement journey — only for students
    isAdmin ? Promise.resolve([]) : prisma.application.findMany({
      where: { userId: session.user.id, isRemoved: false },
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        status: true,
        jobId: true,
        job: { select: { title: true, companyName: true, salary: true } },
      },
    }).then(async (apps) => {
      if (!apps.length) return []
      const jobIds = apps.map((a) => a.jobId)
      const attendanceRecords = await prisma.attendance.findMany({
        where: { studentId: session.user.id, jobId: { in: jobIds } },
        select: { jobId: true, round: true, scannedAt: true },
        orderBy: { createdAt: 'asc' },
      })
      const attendanceByJob = attendanceRecords.reduce<Record<string, typeof attendanceRecords>>((acc, r) => {
        if (!r.jobId) return acc
        if (!acc[r.jobId]) acc[r.jobId] = []
        acc[r.jobId].push(r)
        return acc
      }, {})
      return apps.map((app) => ({
        ...app,
        attendance: attendanceByJob[app.jobId] ?? [],
      }))
    }).catch(() => []),
  ])

  // Calculate profile completion
  const profileCompletionScore = user.profile ? calculateProfileCompletion(user.profile) : 0
  const hasProfile = !!user.profile
  const isKycVerified = user.profile?.kycStatus === 'VERIFIED'

  return (
    <main className="flex-1 bg-white min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Welcome Header */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Welcome back, {session.user.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {isAdmin
                  ? "Manage placements and track student progress"
                  : "Track your placement journey and explore new opportunities"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!isAdmin && (
                <>
                  <Link href="/profile">
                    <Button size="sm" variant="outline">Update Profile</Button>
                  </Link>
                  {isKycVerified && (
                    <Link href="/documents">
                      <Button size="sm" variant="outline">Download ID Card</Button>
                    </Link>
                  )}
                  <Link href="/jobs">
                    <Button size="sm">Browse Jobs</Button>
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link href="/admin">
                  <Button size="sm">Admin Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        {siteSettings.announcementActive && siteSettings.announcementText && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">
                    {siteSettings.placementSeasonName}
                  </h3>
                  <p className="text-sm text-blue-800 mt-1">
                    {siteSettings.announcementText}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Status Alert for students */}
        {!isAdmin && !hasProfile && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">
                    Profile Setup Required
                  </h3>
                  <p className="text-sm text-red-800 mt-1">
                    Please complete your profile to access placement opportunities.
                  </p>
                </div>
                <Link href="/profile">
                  <Button size="sm">
                    Create Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAdmin && hasProfile && user.profile?.kycStatus === 'PENDING' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">
                    KYC Verification Pending
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your account is under review. Please upload your College ID card for verification.
                  </p>
                </div>
                <Link href="/profile">
                  <Button size="sm" variant="outline">
                    Upload Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAdmin && hasProfile && user.profile?.kycStatus === 'UNDER_REVIEW' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">
                    KYC Verification In Progress
                  </h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Your documents are being verified by the admin. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isAdmin && profileCompletionScore < 100 && isKycVerified && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your profile is {profileCompletionScore}% complete. Complete it to apply for jobs.
                  </p>
                  <Progress value={profileCompletionScore} className="mt-3 h-2" />
                </div>
                <Link href="/profile">
                  <Button size="sm" variant="outline">
                    Complete Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  {verifiedProfiles} verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {totalJobs} total posted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totalStudents || 0) - (verifiedProfiles || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need verification
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Available to apply
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myApplications || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileCompletionScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Completion
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placement Journey — students only */}
        {!isAdmin && placementJourney.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Placement Journey</CardTitle>
                  <CardDescription>Your progress at each company — rounds attended and current status</CardDescription>
                </div>
                <Link href="/attendance">
                  <Button variant="ghost" size="sm">My QR Codes</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {placementJourney.map((app: any) => {
                  const attended = app.attendance.filter((a: any) => a.scannedAt)
                  const pending = app.attendance.filter((a: any) => !a.scannedAt)
                  const isRejected = app.status === 'REJECTED' || app.status === 'OFFER_REJECTED'
                  const isPlaced = app.status === 'SELECTED' || app.status === 'OFFER_ACCEPTED'
                  const statusColor = isPlaced
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : isRejected
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                  const statusLabel: Record<string, string> = {
                    APPLIED: 'Applied',
                    SHORTLISTED: 'Shortlisted',
                    INTERVIEW_SCHEDULED: 'Interview Scheduled',
                    INTERVIEWED: 'Interviewed',
                    SELECTED: 'Selected ✓',
                    OFFER_ACCEPTED: 'Offer Accepted ✓',
                    OFFER_REJECTED: 'Offer Rejected',
                    REJECTED: 'Not Selected',
                  }
                  return (
                    <div key={app.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{app.job.companyName}</p>
                          <p className="text-xs text-muted-foreground">{app.job.title} · {app.job.salary} LPA</p>
                        </div>
                        <Badge className={`${statusColor} border text-xs shrink-0`}>
                          {statusLabel[app.status] ?? app.status}
                        </Badge>
                      </div>
                      {app.attendance.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rounds</p>
                          <div className="flex flex-wrap gap-2">
                            {app.attendance.map((a: any, i: number) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                                  a.scannedAt
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                                }`}
                              >
                                {a.scannedAt ? '✓' : '○'} {a.round ?? 'Round'}
                              </span>
                            ))}
                          </div>
                          {isRejected && attended.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Attended {attended.length} round{attended.length > 1 ? 's' : ''} — not selected after{' '}
                              <span className="font-medium">{attended[attended.length - 1]?.round ?? 'final round'}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Job Openings</CardTitle>
                  <CardDescription>Latest opportunities posted</CardDescription>
                </div>
                <Link href="/jobs">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active jobs at the moment</p>
                  <p className="text-xs mt-1">Check back later for new opportunities</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between py-3 hover:bg-muted/40 px-1 rounded transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.companyName} · {job.salary} LPA</p>
                      </div>
                      {job.deadline && (
                        <span className="text-xs text-muted-foreground ml-3 shrink-0">
                          Due {format(new Date(job.deadline), "MMM d")}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Scheduled interviews and sessions</CardDescription>
                </div>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEventsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming events</p>
                  <p className="text-xs mt-1">Events will appear here when scheduled</p>
                </div>
              ) : (
                <div className="divide-y">
                  {upcomingEventsList.map((event) => (
                    <div key={event.id} className="flex items-center justify-between py-3 px-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.location ?? event.type}</p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-3 shrink-0">
                        {format(new Date(event.date), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: any): number {
  let score = 0
  const totalFields = 20

  // Personal Information (5 points)
  if (profile.firstName) score++
  if (profile.lastName) score++
  if (profile.dateOfBirth) score++
  if (profile.gender) score++
  if (profile.phone || profile.callingMobile) score++

  // Contact Details (3 points)
  if (profile.email || profile.studentEmail) score++
  if (profile.currentAddress) score++
  if (profile.permanentAddress) score++

  // Academic Information (5 points)
  if (profile.usn) score++
  if (profile.branch) score++
  if (profile.cgpa || profile.finalCgpa) score++
  if (profile.tenthPercentage) score++
  if (profile.twelfthPercentage) score++

  // Professional Information (4 points)
  if (profile.skills && profile.skills.length > 0) score++
  if (profile.resume || profile.resumeUpload) score++
  if (profile.linkedin || profile.linkedinLink) score++
  if (profile.github || profile.githubLink) score++

  // KYC Status (3 points)
  if (profile.kycStatus === 'VERIFIED') score += 3
  else if (profile.kycStatus === 'UNDER_REVIEW') score += 1

  return Math.round((score / totalFields) * 100)
}
