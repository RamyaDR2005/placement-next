import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"
import { z } from "zod"
import * as XLSX from "xlsx"

const SHEET_TYPES = ["profiles", "applications", "placements", "attendance"] as const

const backupSchema = z.object({
  batchYear: z.string().regex(/^\d{4}$/, "Batch year must be a 4-digit string"),
  includeSheets: z
    .array(z.enum(SHEET_TYPES))
    .min(1, "At least one sheet type is required"),
})

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error || !session) {
    return (
      error || NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  let backupLog: { id: string } | null = null

  try {
    const body = await request.json()
    const parsed = backupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { batchYear, includeSheets } = parsed.data

    // Check total record count before proceeding to prevent OOM
    const MAX_RECORDS_PER_SHEET = 10000
    const estimatedCount = await prisma.profile.count({
      where: { batch: { startsWith: batchYear } },
    })
    if (estimatedCount > MAX_RECORDS_PER_SHEET) {
      return NextResponse.json(
        { error: `Too many records (${estimatedCount}). Maximum ${MAX_RECORDS_PER_SHEET} per export. Contact admin for a database dump.` },
        { status: 400 }
      )
    }

    // Create BackupLog entry with PENDING status
    backupLog = await prisma.backupLog.create({
      data: {
        adminId: session.user.id,
        batchYear,
        status: "PENDING",
        fields: includeSheets,
      },
    })

    const workbook = XLSX.utils.book_new()
    let totalRecords = 0

    // Profiles sheet
    if (includeSheets.includes("profiles")) {
      const profiles = await prisma.profile.findMany({
        where: { batch: { startsWith: batchYear } },
        take: MAX_RECORDS_PER_SHEET,
        select: {
          firstName: true,
          lastName: true,
          usn: true,
          branch: true,
          batch: true,
          callingMobile: true,
          finalCgpa: true,
          kycStatus: true,
          linkedinLink: true,
          githubLink: true,
          resumeUpload: true,
          user: { select: { email: true } },
        },
      })

      const profileData = profiles.map((p, index) => ({
        "S.No": index + 1,
        "First Name": p.firstName ?? "N/A",
        "Last Name": p.lastName ?? "N/A",
        USN: p.usn ?? "N/A",
        Branch: p.branch ?? "N/A",
        Batch: p.batch ?? "N/A",
        Email: p.user?.email ?? "N/A",
        Phone: p.callingMobile ?? "N/A",
        "Final CGPA": p.finalCgpa ?? "N/A",
        "KYC Status": p.kycStatus ?? "N/A",
        LinkedIn: p.linkedinLink ?? "N/A",
        GitHub: p.githubLink ?? "N/A",
        Resume: p.resumeUpload ?? "N/A",
      }))

      const ws = XLSX.utils.json_to_sheet(profileData)
      XLSX.utils.book_append_sheet(workbook, ws, "Profiles")
      totalRecords += profiles.length
    }

    // Applications sheet
    if (includeSheets.includes("applications")) {
      const applications = await prisma.application.findMany({
        where: {
          isRemoved: false,
          user: { profile: { batch: { startsWith: batchYear } } },
        },
        take: MAX_RECORDS_PER_SHEET,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              profile: {
                select: { firstName: true, lastName: true, usn: true, batch: true },
              },
            },
          },
          job: { select: { title: true, companyName: true } },
        },
        orderBy: { appliedAt: "desc" },
      })

      const appData = applications.map((app, index) => ({
        "S.No": index + 1,
        "Student Name":
          app.user.name ??
          `${app.user.profile?.firstName ?? ""} ${app.user.profile?.lastName ?? ""}`.trim() ??
          "N/A",
        Email: app.user.email,
        USN: app.user.profile?.usn ?? "N/A",
        Batch: app.user.profile?.batch ?? "N/A",
        "Job Title": app.job.title,
        "Company Name": app.job.companyName,
        "Applied Date": new Date(app.appliedAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      }))

      const ws = XLSX.utils.json_to_sheet(appData)
      XLSX.utils.book_append_sheet(workbook, ws, "Applications")
      totalRecords += applications.length
    }

    // Placements sheet
    if (includeSheets.includes("placements")) {
      const placements = await prisma.placement.findMany({
        where: {
          user: { profile: { batch: { startsWith: batchYear } } },
        },
        take: MAX_RECORDS_PER_SHEET,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              profile: {
                select: { firstName: true, lastName: true, usn: true, branch: true, batch: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      const placementData = placements.map((p, index) => ({
        "S.No": index + 1,
        "Student Name":
          p.user.name ??
          `${p.user.profile?.firstName ?? ""} ${p.user.profile?.lastName ?? ""}`.trim() ??
          "N/A",
        Email: p.user.email,
        USN: p.user.profile?.usn ?? "N/A",
        Branch: p.user.profile?.branch ?? "N/A",
        Batch: p.user.profile?.batch ?? "N/A",
        "Company Name": p.companyName,
        "Salary (LPA)": p.salary,
        Tier: p.tier,
      }))

      const ws = XLSX.utils.json_to_sheet(placementData)
      XLSX.utils.book_append_sheet(workbook, ws, "Placements")
      totalRecords += placements.length
    }

    // Attendance sheet
    if (includeSheets.includes("attendance")) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: {
            in: (
              await prisma.profile.findMany({
                where: { batch: { startsWith: batchYear } },
                select: { userId: true },
              })
            ).map((p) => p.userId),
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Get student profiles for the attendance records
      const studentIds = [...new Set(attendanceRecords.map((a) => a.studentId))]
      const studentProfiles = await prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: { firstName: true, lastName: true, usn: true, batch: true },
          },
        },
      })

      const profileMap = new Map(studentProfiles.map((s) => [s.id, s]))

      const attendanceData = attendanceRecords.map((a, index) => {
        const student = profileMap.get(a.studentId)
        return {
          "S.No": index + 1,
          "Student Name":
            student?.name ??
            `${student?.profile?.firstName ?? ""} ${student?.profile?.lastName ?? ""}`.trim() ??
            "N/A",
          Email: student?.email ?? "N/A",
          USN: student?.profile?.usn ?? "N/A",
          Batch: student?.profile?.batch ?? "N/A",
          "Scanned At": a.scannedAt
            ? new Date(a.scannedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Not Scanned",
          Location: a.location ?? "N/A",
          Notes: a.notes ?? "N/A",
        }
      })

      const ws = XLSX.utils.json_to_sheet(attendanceData)
      XLSX.utils.book_append_sheet(workbook, ws, "Attendance")
      totalRecords += attendanceRecords.length
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Update BackupLog to COMPLETED
    await prisma.backupLog.update({
      where: { id: backupLog.id },
      data: {
        status: "COMPLETED",
        recordCount: totalRecords,
        fileSize: buffer.byteLength,
        completedAt: new Date(),
      },
    })

    // Log security event
    logSecurityEvent("batch_data_backup", {
      adminId: session.user.id,
      batchYear,
      sheets: includeSheets,
      recordCount: totalRecords,
      fileSize: buffer.byteLength,
      timestamp: new Date().toISOString(),
    })

    const filename = `CampusConnect_Backup_${batchYear}_${new Date().toISOString().split("T")[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("Error creating backup:", err)

    // Update BackupLog to FAILED if it was created
    if (backupLog) {
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: "FAILED",
          errorMessage:
            err instanceof Error ? err.message : "Unknown error occurred",
        },
      })
    }

    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    )
  }
}
