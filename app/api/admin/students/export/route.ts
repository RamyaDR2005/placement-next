import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const { searchParams } = request.nextUrl
  const q = searchParams.get("q") ?? ""
  const kycStatus = searchParams.get("kycStatus")
  const branch = searchParams.get("branch")
  const batchId = searchParams.get("batchId")
  const placed = searchParams.get("placed") // "yes" | "no" | null

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    ...(batchId ? { batchId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { profile: { usn: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(kycStatus ? { profile: { kycStatus: kycStatus as any } } : {}),
    ...(branch ? { profile: { branch: branch as any } } : {}),
  }

  const students = await prisma.user.findMany({
    where,
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          usn: true,
          branch: true,
          batch: true,
          kycStatus: true,
          finalCgpa: true,
          cgpa: true,
          callingMobile: true,
          whatsappMobile: true,
        },
      },
      placements: { select: { salary: true, tier: true, companyName: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Filter by placement status in memory (simpler than a complex Prisma join)
  const filtered = placed
    ? students.filter((s) =>
        placed === "yes" ? s.placements.length > 0 : s.placements.length === 0
      )
    : students

  const exportData = filtered.map((s, idx) => {
    const topPlacement = s.placements[0]
    return {
      "S.No": idx + 1,
      Name: s.name ?? (`${s.profile?.firstName ?? ""} ${s.profile?.lastName ?? ""}`.trim() || "N/A"),
      Email: s.email,
      USN: s.profile?.usn ?? "N/A",
      Branch: s.profile?.branch ?? "N/A",
      Batch: s.profile?.batch ?? "N/A",
      "KYC Status": s.profile?.kycStatus ?? "N/A",
      CGPA: s.profile?.finalCgpa ?? s.profile?.cgpa ?? "N/A",
      Phone: s.profile?.callingMobile ?? "N/A",
      "Total Applications": s._count.applications,
      "Placement Status": topPlacement ? "Placed" : "Unplaced",
      "Placed At": topPlacement?.companyName ?? "N/A",
      "Package (LPA)": topPlacement?.salary ?? "N/A",
      "Placement Tier": topPlacement?.tier ?? "N/A",
    }
  })

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const colWidths = Object.keys(exportData[0] ?? {}).map((k) => ({
    wch: Math.max(k.length, ...exportData.map((r) => String(r[k as keyof typeof r] ?? "").length)) + 2,
  }))
  worksheet["!cols"] = colWidths
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students")

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

  logSecurityEvent("students_exported", {
    adminId: session.user.id,
    count: filtered.length,
    filters: { q, kycStatus, branch, batchId, placed },
    timestamp: new Date().toISOString(),
  })

  const filename = `Students_Export_${new Date().toISOString().split("T")[0]}.xlsx`

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
