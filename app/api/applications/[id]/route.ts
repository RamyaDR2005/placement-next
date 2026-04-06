import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// DELETE /api/applications/[id] — Withdraw an application (only allowed when status is APPLIED)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const application = await prisma.application.findUnique({
            where: { id },
            select: { id: true, userId: true, status: true, isRemoved: true, job: { select: { title: true, companyName: true } } }
        })

        if (!application || application.userId !== session.user.id) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        if (application.isRemoved) {
            return NextResponse.json({ error: "Application already removed" }, { status: 400 })
        }

        if (application.status !== "APPLIED") {
            return NextResponse.json(
                { error: "You can only withdraw applications that are still in 'Applied' status" },
                { status: 400 }
            )
        }

        await prisma.application.update({
            where: { id },
            data: {
                isRemoved: true,
                removedAt: new Date(),
                removedBy: session.user.id,
                removalReason: "Withdrawn by student",
            }
        })

        return NextResponse.json({ success: true, message: `Application for ${application.job.title} at ${application.job.companyName} withdrawn` })
    } catch (error) {
        console.error("Error withdrawing application:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
