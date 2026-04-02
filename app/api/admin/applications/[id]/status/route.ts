import { prisma } from "@/lib/prisma"
import { ApplicationStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"

const VALID_STATUSES = new Set<ApplicationStatus>([
    "APPLIED",
    "SHORTLISTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "SELECTED",
    "OFFER_ACCEPTED",
    "OFFER_REJECTED",
    "REJECTED",
])

const STATUS_NOTIFICATIONS: Record<ApplicationStatus, { title: string; message: (company: string) => string }> = {
    APPLIED: {
        title: "Application Received",
        message: (company) => `Your application at ${company} has been received.`,
    },
    SHORTLISTED: {
        title: "Application Shortlisted",
        message: (company) => `Congratulations! You've been shortlisted at ${company}.`,
    },
    INTERVIEW_SCHEDULED: {
        title: "Interview Scheduled",
        message: (company) => `Your interview at ${company} has been scheduled. Check the portal for details.`,
    },
    INTERVIEWED: {
        title: "Interview Completed",
        message: (company) => `Your interview at ${company} has been recorded.`,
    },
    SELECTED: {
        title: "Selected!",
        message: (company) => `Congratulations! You've been selected at ${company}! 🎉`,
    },
    OFFER_ACCEPTED: {
        title: "Offer Accepted",
        message: (company) => `Your offer from ${company} has been accepted.`,
    },
    OFFER_REJECTED: {
        title: "Offer Rejected",
        message: (company) => `Your offer from ${company} has been marked as rejected.`,
    },
    REJECTED: {
        title: "Application Update",
        message: (company) => `Your application at ${company} was not selected for this role.`,
    },
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: applicationId } = await params
        const { error, session } = await requireAdmin()

        if (error || !session) {
            return error || NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { status, feedback, interviewDate } = await request.json()

        if (!status || !VALID_STATUSES.has(status as ApplicationStatus)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}` },
                { status: 400 }
            )
        }

        // Fetch the application with job and user info
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: { select: { title: true, companyName: true } },
                user: { select: { id: true, name: true } },
            },
        })

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        if (application.isRemoved) {
            return NextResponse.json({ error: "Cannot update a removed application" }, { status: 400 })
        }

        // Update the application
        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: status as ApplicationStatus,
                ...(feedback !== undefined && { adminFeedback: feedback || null }),
                ...(interviewDate && { interviewDate: new Date(interviewDate) }),
            },
        })

        // Send notification to the student
        const notif = STATUS_NOTIFICATIONS[status as ApplicationStatus]
        if (notif) {
            await prisma.notification.create({
                data: {
                    userId: application.user.id,
                    title: notif.title,
                    message: notif.message(application.job.companyName),
                    type: status === "INTERVIEW_SCHEDULED" ? "INTERVIEW_SCHEDULED" : "APPLICATION_STATUS",
                    data: {
                        applicationId,
                        jobId: application.jobId,
                        status,
                        ...(interviewDate && { interviewDate }),
                    },
                },
            })
        }

        logSecurityEvent("application_status_updated", {
            adminId: session.user.id,
            applicationId,
            oldStatus: application.status,
            newStatus: status,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({ success: true, data: { application: updated } })
    } catch (error) {
        console.error("Error updating application status:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
