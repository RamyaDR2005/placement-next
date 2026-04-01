import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, sanitizeInput, logSecurityEvent } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const { error, session } = await requireAdmin()

    if (error || !session) {
      logSecurityEvent("unauthorized_admin_access", {
        endpoint: "/api/admin/kyc-verification",
        ip: request.headers.get("x-forwarded-for") || "unknown"
      })
      return error
    }

    const { profileId, status, notes, verifiedBy } = await request.json()

    // Input validation
    if (!profileId || !status || !verifiedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedNotes = notes ? sanitizeInput(notes) : null
    const sanitizedVerifiedBy = sanitizeInput(verifiedBy)

    // Verify profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true, userId: true }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Update the profile with verification status
    const updatedProfile = await prisma.profile.update({
      where: { id: profileId },
      data: {
        kycStatus: status,
        verifiedBy: sanitizedVerifiedBy,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        remarks: sanitizedNotes,
        updatedAt: new Date()
      }
    })

    // Log security event
    logSecurityEvent("kyc_verification_updated", {
      adminId: session.user.id,
      profileId,
      status,
      timestamp: new Date().toISOString()
    })

    // Send in-app notification to the student
    const notificationMessages: Record<string, { title: string; message: string }> = {
      VERIFIED: {
        title: "Profile Verified",
        message: "Your profile has been verified by the placement cell. You are now eligible to apply for placement opportunities.",
      },
      REJECTED: {
        title: "Profile Verification Rejected",
        message: `Your profile verification was rejected. ${sanitizedNotes ? `Reason: ${sanitizedNotes}` : "Please contact the placement cell for more details."}`,
      },
      PENDING: {
        title: "Profile Under Review",
        message: "Your profile has been marked as pending review by the placement cell.",
      },
    }

    const notif = notificationMessages[status]
    if (notif) {
      await prisma.notification.create({
        data: {
          userId: existingProfile.userId,
          title: notif.title,
          message: notif.message,
          type: "KYC_UPDATE",
        },
      }).catch((err: unknown) => {
        // Non-fatal — log but don't fail the KYC update
        console.error("Failed to create KYC notification:", err)
      })
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Error updating KYC status:", error)
    logSecurityEvent("kyc_verification_error", {
      error: error instanceof Error ? error.message : "Unknown error"
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
