export const dynamic = "force-dynamic"

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

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  })()

  const statusLabel: Record<string, string> = {
    APPLIED: "Applied", SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled", INTERVIEWED: "Interviewed",
    SELECTED: "Selected", OFFER_ACCEPTED: "Offer Accepted",
    OFFER_REJECTED: "Offer Rejected", REJECTED: "Not Selected",
  }

  return (
    <main className="flex-1 bg-[#FAFAF9] min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">

        {/* ── Welcome header ── */}
        <div className="rounded-2xl border border-[#E8E5E1] bg-white px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-widest mb-1">
                {siteSettings.placementSeasonName}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
                {greeting}, {session.user.name?.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-[#71717A]">
                {isAdmin
                  ? "Manage placements and track student progress"
                  : "Track your placement journey and explore new opportunities"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isAdmin && (
                <>
                  <Link href="/profile">
                    <Button size="sm" variant="outline" className="h-8 border-[#E8E5E1] text-xs text-[#52525B] hover:bg-[#F4F0EB]">
                      Update Profile
                    </Button>
                  </Link>
                  {isKycVerified && (
                    <Link href="/documents">
                      <Button size="sm" variant="outline" className="h-8 border-[#E8E5E1] text-xs text-[#52525B] hover:bg-[#F4F0EB]">
                        ID Card
                      </Button>
                    </Link>
                  )}
                  <Link href="/jobs">
                    <Button size="sm" className="h-8 bg-[#18181B] hover:bg-[#27272A] text-white text-xs">
                      Browse Jobs
                    </Button>
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button size="sm" className="h-8 bg-[#18181B] hover:bg-[#27272A] text-white text-xs">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Announcement ── */}
        {siteSettings.announcementActive && siteSettings.announcementText && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-900">{siteSettings.announcementText}</p>
            </div>
          </div>
        )}

        {/* ── Status banners ── */}
        {!isAdmin && !hasProfile && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-900">Profile setup required</p>
              <p className="text-xs text-red-700 mt-0.5">Complete your profile to access placement opportunities.</p>
            </div>
            <Link href="/profile">
              <Button size="sm" className="h-8 shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs">
                Set up now
              </Button>
            </Link>
          </div>
        )}

        {!isAdmin && hasProfile && user.profile?.kycStatus === "PENDING" && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">KYC verification pending</p>
              <p className="text-xs text-amber-700 mt-0.5">Upload your College ID card to complete verification.</p>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="h-8 shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 text-xs">
                Upload docs
              </Button>
            </Link>
          </div>
        )}

        {!isAdmin && hasProfile && user.profile?.kycStatus === "UNDER_REVIEW" && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-sm text-blue-800">
              <span className="font-semibold text-blue-900">Verification in progress — </span>
              Your documents are being reviewed. You&apos;ll be notified once approved.
            </p>
          </div>
        )}

        {!isAdmin && profileCompletionScore < 100 && isKycVerified && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Profile {profileCompletionScore}% complete
              </p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-200">
                <div
                  className="h-1.5 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${profileCompletionScore}%` }}
                />
              </div>
            </div>
            <Link href="/profile">
              <Button size="sm" variant="outline" className="h-8 shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100 text-xs">
                Complete
              </Button>
            </Link>
          </div>
        )}

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {!isAdmin ? (
            <>
              {[
                { label: "Open Jobs",      value: activeJobs,             sub: "available now",         accent: "border-l-blue-400" },
                { label: "Applications",   value: myApplications ?? 0,    sub: "submitted",             accent: "border-l-violet-400" },
                { label: "Events",         value: upcomingEvents,         sub: "upcoming",              accent: "border-l-amber-400" },
                { label: "Profile Score",  value: `${profileCompletionScore}%`, sub: "completion",     accent: "border-l-emerald-400" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border border-[#E8E5E1] border-l-4 ${s.accent} bg-white px-4 py-4`}>
                  <p className="font-display text-2xl font-bold text-[#18181B]">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#71717A]">{s.label}</p>
                  <p className="text-[11px] text-[#A1A1AA]">{s.sub}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                { label: "Students",      value: totalStudents ?? 0,                        sub: `${verifiedProfiles} verified`,        accent: "border-l-blue-400" },
                { label: "Active Jobs",   value: activeJobs,                                sub: `${totalJobs} total`,                  accent: "border-l-emerald-400" },
                { label: "Events",        value: upcomingEvents,                            sub: "upcoming",                            accent: "border-l-amber-400" },
                { label: "Pending KYC",   value: (totalStudents ?? 0) - (verifiedProfiles ?? 0), sub: "awaiting review",               accent: "border-l-red-400" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border border-[#E8E5E1] border-l-4 ${s.accent} bg-white px-4 py-4`}>
                  <p className="font-display text-2xl font-bold text-[#18181B]">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#71717A]">{s.label}</p>
                  <p className="text-[11px] text-[#A1A1AA]">{s.sub}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Placement journey (students only) ── */}
        {!isAdmin && placementJourney.length > 0 && (
          <div className="rounded-2xl border border-[#E8E5E1] bg-white">
            <div className="flex items-center justify-between border-b border-[#F4F0EB] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#18181B]">Placement Journey</h2>
                <p className="text-xs text-[#A1A1AA]">Your progress at each company</p>
              </div>
              <Link href="/attendance" className="text-xs text-[#71717A] hover:text-[#18181B] transition-colors">
                My QR Codes →
              </Link>
            </div>
            <div className="divide-y divide-[#F4F0EB]">
              {placementJourney.map((app: any) => {
                const isPlaced = app.status === "SELECTED" || app.status === "OFFER_ACCEPTED"
                const isRejected = app.status === "REJECTED" || app.status === "OFFER_REJECTED"
                const attended = app.attendance.filter((a: any) => a.scannedAt)
                return (
                  <div key={app.id} className="flex items-start gap-4 px-5 py-4">
                    <div
                      className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: isPlaced ? "#10b981" : isRejected ? "#ef4444" : "#f59e0b"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#18181B]">{app.job.companyName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isPlaced ? "bg-emerald-50 text-emerald-700"
                          : isRejected ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                        }`}>
                          {statusLabel[app.status] ?? app.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{app.job.title}</p>
                      {app.attendance.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {app.attendance.map((a: any, i: number) => (
                            <span key={i} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                              a.scannedAt
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-[#E8E5E1] bg-[#F4F4F5] text-[#A1A1AA]"
                            }`}>
                              {a.scannedAt ? "✓" : "○"} {a.round ?? `Round ${i + 1}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {isRejected && attended.length > 0 && (
                        <p className="mt-1.5 text-xs text-[#A1A1AA]">
                          Attended {attended.length} round{attended.length !== 1 ? "s" : ""} — not selected after{" "}
                          {attended[attended.length - 1]?.round ?? "final round"}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Recent jobs & events ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent jobs */}
          <div className="rounded-2xl border border-[#E8E5E1] bg-white">
            <div className="flex items-center justify-between border-b border-[#F4F0EB] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#18181B]">Recent Job Openings</h2>
              <Link href="/jobs" className="text-xs text-[#71717A] hover:text-[#18181B] transition-colors">
                View all →
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[#A1A1AA]">No active jobs right now</p>
                <p className="text-xs text-[#C4C4C4] mt-1">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F0EB]">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#18181B] truncate group-hover:text-amber-700 transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{job.companyName} · {job.salary} LPA</p>
                    </div>
                    {job.deadline && (
                      <span className="ml-3 shrink-0 text-[11px] text-[#A1A1AA]">
                        Due {format(new Date(job.deadline), "MMM d")}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="rounded-2xl border border-[#E8E5E1] bg-white">
            <div className="flex items-center justify-between border-b border-[#F4F0EB] px-5 py-4">
              <h2 className="text-sm font-semibold text-[#18181B]">Upcoming Events</h2>
              <Link href="/schedule" className="text-xs text-[#71717A] hover:text-[#18181B] transition-colors">
                View all →
              </Link>
            </div>
            {upcomingEventsList.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[#A1A1AA]">No upcoming events</p>
                <p className="text-xs text-[#C4C4C4] mt-1">Events will appear here when scheduled</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F0EB]">
                {upcomingEventsList.map((event) => (
                  <div key={event.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#18181B] truncate">{event.title}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{event.location ?? event.type}</p>
                    </div>
                    <span className="ml-3 shrink-0 text-[11px] text-[#71717A] font-medium">
                      {format(new Date(event.date), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
