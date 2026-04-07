export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ApplicantsTable } from "@/components/admin/applicants-table"
import { JobAnnouncementsPanel } from "@/components/admin/job-announcements-panel"

type ApplicationWithUser = {
    id: string
    userId: string
    appliedAt: Date
    status: string
    adminFeedback: string | null
    interviewDate: Date | null
    resumeUsed: string | null
    user: {
        id: string
        name: string | null
        email: string
        profile: {
            firstName: string | null
            lastName: string | null
            usn: string | null
            branch: string | null
            batch: string | null
            cgpa: number | null
            callingMobile: string | null
            email: string | null
            resume: string | null
        } | null
    }
}

export const metadata: Metadata = {
    title: "Job Applicants | Admin",
    description: "View and manage job applicants",
}

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
        redirect("/dashboard")
    }

    // Fetch job with applications
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            applications: {
                where: { isRemoved: false },
                orderBy: { appliedAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    usn: true,
                                    branch: true,
                                    batch: true,
                                    cgpa: true,
                                    callingMobile: true,
                                    email: true,
                                    resume: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!job) {
        notFound()
    }

    // Count removed applications
    const removedCount = await prisma.application.count({
        where: { jobId: id, isRemoved: true }
    })

    // Check if there are any placements for this job
    const placementsCount = await prisma.placement.count({
        where: { jobId: id }
    })

    // Format applicants for the table
    const applicants = job.applications.map((app: ApplicationWithUser) => {
        const profile = app.user.profile
        return {
            id: app.id,
            userId: app.userId,
            name: app.user.name || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown',
            email: app.user.email || profile?.email || '',
            phone: profile?.callingMobile || '',
            usn: profile?.usn || '',
            branch: profile?.branch || '',
            batch: profile?.batch || '',
            cgpa: profile?.cgpa ?? null,
            appliedAt: app.appliedAt,
            status: app.status,
            adminFeedback: app.adminFeedback,
            interviewDate: app.interviewDate,
            resumeUrl: app.resumeUsed || profile?.resume || '',
        }
    })

    const tierLabel = job.tier.replace("_", " ")
    const categoryLabel = job.category.replace(/_/g, " ")

    return (
        <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
            {/* Back nav */}
            <div className="flex items-center gap-3">
                <Link href="/admin/jobs">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500 hover:text-[#18181B] h-8 text-xs">
                        <ArrowLeft className="h-3.5 w-3.5" /> Jobs
                    </Button>
                </Link>
            </div>

            {/* Job header card */}
            <div className="rounded-2xl border border-[#E8E5E1] bg-white px-6 py-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">{job.title}</h1>
                        <p className="mt-1 text-sm text-zinc-500">{job.companyName} · {job.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${job.isDreamOffer ? "bg-violet-50 text-violet-700 ring-violet-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                            {job.isDreamOffer ? "Dream Offer" : tierLabel}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-600">
                            {categoryLabel}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${job.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-zinc-100 text-zinc-500 ring-zinc-200"}`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Active Applicants", value: job.applications.length, color: "text-[#18181B]" },
                        { label: "Removed", value: removedCount, color: "text-red-600" },
                        { label: "Placed", value: placementsCount, color: "text-emerald-600" },
                        { label: "Package", value: `₹${job.salary} LPA`, color: "text-blue-600" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl border border-[#E8E5E1] bg-zinc-50/60 px-4 py-3 text-center">
                            <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Min CGPA: {job.minCGPA || "None"}</span>
                    <span>·</span>
                    <span>Branches: {job.allowedBranches?.length ? job.allowedBranches.join(", ") : "All"}</span>
                    <span>·</span>
                    <span>Deadline: {job.deadline ? format(new Date(job.deadline), "MMM dd, yyyy hh:mm a") : "No deadline"}</span>
                </p>
            </div>

            <ApplicantsTable jobId={job.id} jobTitle={job.title} applicants={applicants} />
            <JobAnnouncementsPanel jobId={job.id} />
        </div>
    )
}
