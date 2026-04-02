import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"

// POST - Record attendance by scanning QR code
export async function POST(request: NextRequest) {
    try {
        const { error, session } = await requireAdmin()

        if (error || !session) {
            return error
        }

        const { qrData, location, jobId } = await request.json()

        if (!qrData) {
            return NextResponse.json(
                { error: "QR data is required" },
                { status: 400 }
            )
        }

        // Try to parse QR data (could be JSON or just application ID)
        let applicationId: string
        let parsedData: { applicationId?: string } | null = null

        try {
            parsedData = JSON.parse(qrData) as { applicationId?: string }
            applicationId = parsedData.applicationId ?? qrData
        } catch {
            // If not JSON, assume it's just the application ID
            applicationId = qrData
        }

        // Find the attendance record
        const attendance = await prisma.attendance.findFirst({
            where: {
                qrCode: applicationId
            }
        })

        if (!attendance) {
            // Check if this is a valid application
            const application = await prisma.application.findUnique({
                where: { id: applicationId },
                include: {
                    job: {
                        select: { id: true, title: true, companyName: true }
                    }
                }
            })

            if (!application) {
                return NextResponse.json(
                    { error: "Invalid QR code - application not found" },
                    { status: 404 }
                )
            }

            // Check if filtering by job
            if (jobId && application.jobId !== jobId) {
                return NextResponse.json(
                    { error: "This application is for a different job" },
                    { status: 400 }
                )
            }

            // Create new attendance record if it doesn't exist
            const newAttendance = await prisma.attendance.create({
                data: {
                    studentId: application.userId,
                    jobId: application.jobId,
                    qrCode: applicationId,
                    scannedAt: new Date(),
                    scannedBy: session.user.id,
                    location: location || null
                }
            })

            // Get student info
            const profile = await prisma.profile.findUnique({
                where: { userId: application.userId },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            })

            logSecurityEvent("attendance_recorded", {
                adminId: session.user.id,
                applicationId,
                studentId: application.userId,
                timestamp: new Date().toISOString()
            })

            return NextResponse.json({
                success: true,
                message: "Attendance recorded successfully",
                student: {
                    name: profile?.user?.name || `${profile?.firstName} ${profile?.lastName}`,
                    email: profile?.user?.email,
                    usn: profile?.usn,
                    branch: profile?.branch
                },
                job: {
                    title: application.job.title,
                    company: application.job.companyName
                },
                scannedAt: newAttendance.scannedAt
            })
        }

        // Check if already scanned
        if (attendance.scannedAt) {
            // Get student and job info for the response
            const profile = await prisma.profile.findUnique({
                where: { userId: attendance.studentId },
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            })

            const job = attendance.jobId ? await prisma.job.findUnique({
                where: { id: attendance.jobId },
                select: { title: true, companyName: true }
            }) : null

            return NextResponse.json({
                success: false,
                message: "Attendance already recorded",
                student: {
                    name: profile?.user?.name || `${profile?.firstName} ${profile?.lastName}`,
                    email: profile?.user?.email,
                    usn: profile?.usn,
                    branch: profile?.branch
                },
                job: job ? {
                    title: job.title,
                    company: job.companyName
                } : null,
                scannedAt: attendance.scannedAt
            }, { status: 409 })
        }

        // Update attendance record
        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                scannedAt: new Date(),
                scannedBy: session.user.id,
                location: location || attendance.location
            }
        })

        // Get student info
        const profile = await prisma.profile.findUnique({
            where: { userId: attendance.studentId },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        })

        const job = attendance.jobId ? await prisma.job.findUnique({
            where: { id: attendance.jobId },
            select: { title: true, companyName: true }
        }) : null

        logSecurityEvent("attendance_recorded", {
            adminId: session.user.id,
            attendanceId: attendance.id,
            studentId: attendance.studentId,
            timestamp: new Date().toISOString()
        })

        return NextResponse.json({
            success: true,
            message: "Attendance recorded successfully",
            student: {
                name: profile?.user?.name || `${profile?.firstName} ${profile?.lastName}`,
                email: profile?.user?.email,
                usn: profile?.usn,
                branch: profile?.branch
            },
            job: job ? {
                title: job.title,
                company: job.companyName
            } : null,
            scannedAt: updatedAttendance.scannedAt
        })

    } catch (error) {
        console.error("Error recording attendance:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
