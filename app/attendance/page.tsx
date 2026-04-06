export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import QRCode from "qrcode"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ScanLine, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function AttendancePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { usn: true, firstName: true, lastName: true, branch: true },
  })

  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const jobIds = [...new Set(attendanceRecords.map((a) => a.jobId).filter(Boolean))] as string[]
  const jobs = await prisma.job.findMany({
    where: { id: { in: jobIds } },
    select: { id: true, title: true, companyName: true },
  })
  const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j]))

  const recordsWithQr = await Promise.all(
    attendanceRecords.map(async (record) => {
      const qrDataUrl = await QRCode.toDataURL(record.qrCode, {
        width: 220,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      })
      return { ...record, qrDataUrl, job: record.jobId ? jobMap[record.jobId] : null }
    })
  )

  const pending = recordsWithQr.filter((r) => !r.scannedAt)
  const attended = recordsWithQr.filter((r) => r.scannedAt)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-[#71717A]">
          Show your QR code at each round to mark attendance
        </p>
      </div>

      {attendanceRecords.length === 0 && (
        <div className="rounded-2xl border border-[#E8E5E1] bg-white py-16 text-center">
          <ScanLine className="mx-auto h-8 w-8 text-[#D4CFC9]" />
          <p className="mt-3 text-sm font-medium text-[#52525B]">No attendance sessions yet</p>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            QR codes will appear here once the admin sets up interview rounds.
          </p>
        </div>
      )}

      {/* Pending / Upcoming */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-[#18181B]">
            Upcoming Rounds
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {pending.map((record) => (
              <div
                key={record.id}
                className="rounded-2xl border border-[#E8E5E1] bg-white p-5 flex flex-col items-center gap-4"
              >
                <div className="w-full flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#18181B]">
                      {record.job?.companyName ?? "Company"}
                    </p>
                    <p className="text-xs text-[#71717A] mt-0.5">{record.job?.title}</p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-100"
                  )}>
                    {record.round ?? "General"}
                  </span>
                </div>

                {/* QR */}
                <div className="rounded-xl border border-[#E8E5E1] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={record.qrDataUrl}
                    alt={`QR code for ${record.job?.companyName} ${record.round}`}
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-[#18181B]">{profile?.usn}</p>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-[10px] text-[#A1A1AA] mt-2">
                    Created {format(record.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Attended */}
      {attended.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-[#18181B]">
            Attended
          </h2>
          <div className="space-y-2">
            {attended.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 rounded-2xl border border-[#E8E5E1] bg-white px-5 py-4"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#18181B]">
                    {record.job?.companyName ?? "Company"}
                  </p>
                  <p className="text-xs text-[#71717A]">{record.job?.title}</p>
                  {record.scannedAt && (
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      Scanned {format(record.scannedAt, "dd MMM yyyy, hh:mm a")}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100 shrink-0">
                  {record.round ?? "General"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
