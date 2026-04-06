"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"
import { MapPin, Calendar, ChevronRight, QrCode, FileText, X, CheckCircle2, Clock, Briefcase } from "lucide-react"

interface Application {
  id: string
  appliedAt: string
  status: string
  adminFeedback: string | null
  interviewDate: string | null
  resumeUsed?: string
  job: {
    id: string
    title: string
    companyName: string
    location: string
    jobType: string
    workMode: string
    salary: number
    tier: string
    category: string
    isDreamOffer: boolean
    deadline?: string
  }
  attendance?: { scannedAt?: string }
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  APPLIED:              { label: "Applied",            dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 ring-blue-100" },
  SHORTLISTED:          { label: "Shortlisted",         dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-100" },
  INTERVIEW_SCHEDULED:  { label: "Interview Scheduled", dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-100" },
  INTERVIEWED:          { label: "Interviewed",         dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
  SELECTED:             { label: "Selected",            dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  OFFER_ACCEPTED:       { label: "Offer Accepted",      dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  OFFER_REJECTED:       { label: "Offer Rejected",      dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 ring-orange-100" },
  REJECTED:             { label: "Not Selected",        dot: "bg-red-400",     badge: "bg-red-50 text-red-700 ring-red-100" },
}

const TIER_BORDER: Record<string, string> = {
  DREAM: "border-l-violet-400", TIER_1: "border-l-emerald-400",
  TIER_2: "border-l-blue-400",  TIER_3: "border-l-amber-400",
}

function CompanyAvatar({ name }: { name: string }) {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
  ]
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold", colors[idx])}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" })
      const res = await fetch(`/api/applications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setApplications(data.data.applications)
        setTotalPages(data.data.pagination?.pages || 1)
        const codes: Record<string, string> = {}
        for (const app of data.data.applications) {
          codes[app.id] = await QRCode.toDataURL(
            JSON.stringify({ applicationId: app.id, jobId: app.job.id, company: app.job.companyName })
          )
        }
        setQrCodes(codes)
      }
    } catch {
      toast.error("Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawApplication = async (id: string) => {
    setWithdrawingId(id)
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id))
        toast.success(data.message || "Application withdrawn")
      } else {
        toast.error(data.error || "Failed to withdraw application")
      }
    } catch {
      toast.error("Failed to withdraw application")
    } finally {
      setWithdrawingId(null)
    }
  }

  useEffect(() => { fetchApplications() }, [page])

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-[#71717A]">
            {applications.length > 0
              ? `${applications.length} application${applications.length !== 1 ? "s" : ""} tracked`
              : "Track your placement applications"}
          </p>
        </div>
        <Link href="/jobs">
          <Button size="sm" className="bg-[#18181B] hover:bg-[#27272A] text-white text-sm h-9">
            Browse Jobs
          </Button>
        </Link>
      </div>

      {/* Status summary strip */}
      {!isLoading && applications.length > 0 && (() => {
        const applied = applications.filter(a => a.status === "APPLIED").length
        const shortlisted = applications.filter(a => ["SHORTLISTED","INTERVIEW_SCHEDULED","INTERVIEWED"].includes(a.status)).length
        const selected = applications.filter(a => ["SELECTED","OFFER_ACCEPTED"].includes(a.status)).length
        return (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Applied", count: applied, color: "text-blue-600" },
              { label: "In Progress", count: shortlisted, color: "text-amber-600" },
              { label: "Selected", count: selected, color: "text-emerald-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[#E8E5E1] bg-white px-4 py-3 text-center">
                <p className={cn("font-display text-2xl font-semibold", s.color)}>{s.count}</p>
                <p className="text-xs text-[#71717A] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )
      })()}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-[#E8E5E1] bg-white animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E5E1] bg-white py-16 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-[#D4CFC9]" />
          <p className="mt-3 text-sm font-medium text-[#52525B]">No applications yet</p>
          <p className="mt-1 text-xs text-[#A1A1AA]">Apply to jobs to see them tracked here.</p>
          <Link href="/jobs" className="mt-4 inline-block">
            <Button size="sm" className="bg-[#18181B] text-white hover:bg-[#27272A] mt-3">
              Browse Jobs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.map((app) => {
            const tier = app.job.isDreamOffer ? "DREAM" : app.job.tier
            const tierBorder = TIER_BORDER[tier] ?? "border-l-amber-400"
            const statusCfg = STATUS_CONFIG[app.status]
            return (
              <div
                key={app.id}
                className={cn(
                  "group relative flex items-start gap-4 rounded-2xl border border-[#E8E5E1] border-l-4 bg-white p-5 transition-all hover:border-[#D4CFC9] hover:shadow-sm",
                  tierBorder
                )}
              >
                <CompanyAvatar name={app.job.companyName} />

                <div className="min-w-0 flex-1">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#18181B] leading-tight">{app.job.title}</h3>
                    {app.job.isDreamOffer && (
                      <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ring-violet-100 uppercase tracking-wide text-violet-700">
                        Dream
                      </span>
                    )}
                    {statusCfg && (
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide",
                        statusCfg.badge
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-[#71717A]">{app.job.companyName}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{app.job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}
                    </span>
                    {app.job.salary && (
                      <span className="font-medium text-[#52525B]">₹{app.job.salary} LPA</span>
                    )}
                  </div>

                  {app.interviewDate && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-violet-600">
                      <Clock className="h-3 w-3" />
                      Interview: {format(new Date(app.interviewDate), "MMM d, yyyy h:mm a")}
                    </p>
                  )}

                  {app.adminFeedback && (
                    <p className="mt-2 rounded-lg bg-[#F4F0EB] px-3 py-1.5 text-xs text-[#52525B]">
                      <span className="font-medium">Feedback: </span>{app.adminFeedback}
                    </p>
                  )}

                  {app.attendance?.scannedAt && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Attendance marked {format(new Date(app.attendance.scannedAt), "MMM d, HH:mm")}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Link href={`/jobs/${app.job.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs border-[#E8E5E1] hover:bg-[#F4F0EB]"
                    >
                      View <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>

                  {app.status === "APPLIED" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs border-[#E8E5E1] text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" /> Withdraw
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will withdraw your application for <strong>{app.job.title}</strong> at{" "}
                            <strong>{app.job.companyName}</strong>. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => withdrawApplication(app.id)}
                            disabled={withdrawingId === app.id}
                          >
                            {withdrawingId === app.id ? "Withdrawing…" : "Withdraw"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {app.resumeUsed && (
                    <a href={app.resumeUsed} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-[#E8E5E1] hover:bg-[#F4F0EB]">
                        <FileText className="h-3 w-3" /> Resume
                      </Button>
                    </a>
                  )}

                  {qrCodes[app.id] && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs border-[#E8E5E1] hover:bg-[#F4F0EB]">
                          <QrCode className="h-3 w-3" /> QR
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Attendance QR Code</AlertDialogTitle>
                          <AlertDialogDescription>
                            Show this at {app.job.companyName} events for attendance
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-center py-4">
                          <img src={qrCodes[app.id]} alt="QR Code" className="w-48 h-48 rounded-xl" />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 border-[#E8E5E1] text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-[#A1A1AA]">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 border-[#E8E5E1] text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
