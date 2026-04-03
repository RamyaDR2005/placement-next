import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"

// POST - Record attendance by scanning QR code
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin()
    if (error || !session) return error

    const { qrData, location } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: "QR data is required" }, { status: 400 })
    }

    // qrData is the unique qrCode token stored in the Attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { qrCode: qrData.trim() },
    })

    if (!attendance) {
      return NextResponse.json(
        { error: "Invalid QR code — attendance record not found" },
        { status: 404 }
      )
    }

    // Already scanned
    if (attendance.scannedAt) {
      const profile = await prisma.profile.findUnique({
        where: { userId: attendance.studentId },
        include: { user: { select: { name: true, email: true } } },
      })
      const job = attendance.jobId
        ? await prisma.job.findUnique({
            where: { id: attendance.jobId },
            select: { title: true, companyName: true },
          })
        : null

      return NextResponse.json(
        {
          success: false,
          alreadyScanned: true,
          message: "Attendance already recorded",
          student: {
            name: profile?.user?.name || `${profile?.firstName} ${profile?.lastName}`,
            usn: profile?.usn,
            branch: profile?.branch,
          },
          job: job ? { title: job.title, company: job.companyName } : null,
          round: attendance.round,
          scannedAt: attendance.scannedAt,
        },
        { status: 409 }
      )
    }

    // Mark attended
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        scannedAt: new Date(),
        scannedBy: session.user.id,
        location: location || null,
      },
    })

    const profile = await prisma.profile.findUnique({
      where: { userId: attendance.studentId },
      include: { user: { select: { name: true, email: true } } },
    })
    const job = attendance.jobId
      ? await prisma.job.findUnique({
          where: { id: attendance.jobId },
          select: { title: true, companyName: true },
        })
      : null

    logSecurityEvent("attendance_recorded", {
      adminId: session.user.id,
      attendanceId: attendance.id,
      studentId: attendance.studentId,
      jobId: attendance.jobId,
      round: attendance.round,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Attendance recorded",
      student: {
        name: profile?.user?.name || `${profile?.firstName} ${profile?.lastName}`,
        usn: profile?.usn,
        branch: profile?.branch,
      },
      job: job ? { title: job.title, company: job.companyName } : null,
      round: attendance.round,
      scannedAt: updated.scannedAt,
    })
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
