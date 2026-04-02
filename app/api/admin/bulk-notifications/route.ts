import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, sanitizeInput, logSecurityEvent } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const { error, session } = await requireAdmin()

    if (error || !session) {
      logSecurityEvent("unauthorized_admin_access", {
        endpoint: "/api/admin/bulk-notifications",
        ip: request.headers.get("x-forwarded-for") || "unknown"
      })
      return error
    }

    const {
      subject,
      message,
      targetGroup,
      selectedBranches,
      verifiedOnly,
      isScheduled,
      scheduledDate,
      scheduledTime,
      adminId
    } = await request.json()

    // Input validation
    if (!subject || !message || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify adminId matches session
    if (adminId !== session.user.id) {
      logSecurityEvent("admin_id_mismatch", {
        sessionUserId: session.user.id,
        providedAdminId: adminId
      })
      return NextResponse.json(
        { error: "Invalid admin ID" },
        { status: 403 }
      )
    }

    // Sanitize inputs
    const sanitizedSubject = sanitizeInput(subject)
    const sanitizedMessage = sanitizeInput(message)

    // Validate subject and message length
    if (sanitizedSubject.length > 200 || sanitizedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Subject or message too long" },
        { status: 400 }
      )
    }

    // Validate targetGroup
    const validTargetGroups = ['all', 'verified', 'branches']
    if (!validTargetGroups.includes(targetGroup)) {
      return NextResponse.json(
        { error: "Invalid target group" },
        { status: 400 }
      )
    }

    // Build the user filter based on targeting options
    let userFilter: Prisma.UserWhereInput = { role: 'STUDENT' }

    if (targetGroup === 'verified' || (targetGroup === 'all' && verifiedOnly)) {
      userFilter.profile = {
        kycStatus: 'VERIFIED'
      }
    } else if (targetGroup === 'branches' && Array.isArray(selectedBranches) && selectedBranches.length > 0) {
      userFilter.profile = {
        branch: { in: selectedBranches }
      }
    }

    // Get target users
    const targetUsers = await prisma.user.findMany({
      where: userFilter,
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    // Log the notification attempt
    logSecurityEvent("bulk_notification_sent", {
      adminId: session.user.id,
      recipientCount: targetUsers.length,
      targetGroup,
      isScheduled,
      timestamp: new Date().toISOString()
    })

    // Create notifications for each target user
    if (targetUsers.length > 0) {
      const notificationsData = targetUsers.map((user: { id: string; name: string | null }) => ({
        userId: user.id,
        title: sanitizedSubject,
        message: sanitizedMessage,
        type: 'SYSTEM' as const,
        isRead: false,
        data: {
          sentBy: adminId,
          targetGroup,
          isScheduled,
          scheduledFor: isScheduled ? `${scheduledDate}T${scheduledTime}` : null
        }
      }))

      // Create all notifications in a single transaction
      await prisma.notification.createMany({
        data: notificationsData
      })

      console.log(`Bulk notification sent to ${targetUsers.length} users`)
    }

    return NextResponse.json({
      success: true,
      recipientCount: targetUsers.length,
      message: "Notification sent successfully"
    })

  } catch (error) {
    console.error("Error sending bulk notification:", error)
    logSecurityEvent("bulk_notification_error", {
      error: error instanceof Error ? error.message : "Unknown error"
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
