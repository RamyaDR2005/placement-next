"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  APPLIED:              { label: "Applied",            className: "bg-blue-50 text-blue-700 border-blue-200" },
  SHORTLISTED:          { label: "Shortlisted",         className: "bg-amber-50 text-amber-700 border-amber-200" },
  INTERVIEW_SCHEDULED:  { label: "Interview Scheduled", className: "bg-purple-50 text-purple-700 border-purple-200" },
  INTERVIEWED:          { label: "Interviewed",         className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  SELECTED:             { label: "Selected",            className: "bg-green-50 text-green-700 border-green-200" },
  OFFER_ACCEPTED:       { label: "Offer Accepted",      className: "bg-green-50 text-green-700 border-green-200" },
  OFFER_REJECTED:       { label: "Offer Rejected",      className: "bg-orange-50 text-orange-700 border-orange-200" },
  REJECTED:             { label: "Not Selected",        className: "bg-red-50 text-red-700 border-red-200" },
}

const CATEGORY_LABELS: Record<string, string> = {
  TRAINING_INTERNSHIP: "Training + Internship", INTERNSHIP: "Internship", FTE: "Full Time",
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})

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
          codes[app.id] = await QRCode.toDataURL(JSON.stringify({ applicationId: app.id, jobId: app.job.id, company: app.job.companyName }))
        }
        setQrCodes(codes)
      }
    } catch {
      toast.error("Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [page])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Applications</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Jobs you have applied to</p>
        </div>
        <Link href="/jobs">
          <Button size="sm">Browse Jobs</Button>
        </Link>
      </div>

      {/* Summary strip */}
      {!isLoading && applications.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="text-2xl font-bold tracking-tight">{applications.length}</span>
          <span className="text-sm text-neutral-500">total applications</span>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-neutral-200 bg-neutral-50 animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 py-16 text-center">
          <p className="text-sm font-medium text-neutral-700">No applications yet</p>
          <p className="text-sm text-neutral-400 mt-1">Start exploring job opportunities and apply to positions.</p>
          <Link href="/jobs" className="mt-4 inline-block">
            <Button size="sm">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status]
            return (
              <Card key={app.id} className="border-neutral-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-neutral-500">
                          {app.job.companyName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-neutral-900">{app.job.title}</h3>
                          {app.job.isDreamOffer && <Badge variant="destructive" className="text-xs px-1.5 py-0">Dream</Badge>}
                          {statusCfg && (
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                              {statusCfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{app.job.companyName}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-neutral-400">
                          <span>{app.job.location}</span>
                          <span className="text-neutral-700 font-medium">₹{app.job.salary} LPA</span>
                          <span>{CATEGORY_LABELS[app.job.category] ?? app.job.category}</span>
                          <span>Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}</span>
                        </div>
                        {app.interviewDate && (
                          <p className="mt-1.5 text-xs text-purple-600">
                            Interview: {format(new Date(app.interviewDate), "MMM d, yyyy h:mm a")}
                          </p>
                        )}
                        {app.adminFeedback && (
                          <p className="mt-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded px-2 py-1">
                            <span className="font-medium">Feedback: </span>{app.adminFeedback}
                          </p>
                        )}
                        {app.attendance?.scannedAt && (
                          <p className="mt-1.5 text-xs text-green-600">
                            Attendance marked {format(new Date(app.attendance.scannedAt), "MMM d, HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/jobs/${app.job.id}`}>
                        <Button variant="outline" size="sm" className="text-xs w-full">View Job</Button>
                      </Link>
                      {app.resumeUsed && (
                        <a href={app.resumeUsed} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-xs w-full">Resume</Button>
                        </a>
                      )}
                      {qrCodes[app.id] && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs w-full">QR Code</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Application QR Code</AlertDialogTitle>
                              <AlertDialogDescription>
                                Show this QR code for attendance at {app.job.companyName} events
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-center py-4">
                              <img src={qrCodes[app.id]} alt="QR Code" className="w-48 h-48" />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
