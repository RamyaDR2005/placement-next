"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Download } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Job { id: string; title: string; companyName: string }
interface Record {
  id: string; round: string | null; scannedAt: string | null; createdAt: string
  student: { name: string; usn: string | null; branch: string | null }
  job: { title: string; company: string } | null
}

export function AttendanceListView({ jobs, rounds }: { jobs: Job[]; rounds: string[] }) {
  const [records, setRecords] = useState<Record[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filterJob, setFilterJob] = useState("")
  const [filterRound, setFilterRound] = useState("")
  const [scannedOnly, setScannedOnly] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterJob) params.set("jobId", filterJob)
    if (filterRound) params.set("round", filterRound)
    if (scannedOnly) params.set("scannedOnly", "true")

    try {
      const res = await fetch(`/api/attendance/list?${params}`)
      const data = await res.json()
      if (data.success) {
        setRecords(data.data)
        setTotal(data.meta.total)
      }
    } finally {
      setLoading(false)
    }
  }, [filterJob, filterRound, scannedOnly])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const exportCsv = () => {
    const rows = [
      ["Name", "USN", "Branch", "Company", "Round", "Attended", "Scanned At"],
      ...records.map((r) => [
        r.student.name,
        r.student.usn ?? "",
        r.student.branch ?? "",
        r.job?.company ?? "",
        r.round ?? "",
        r.scannedAt ? "Yes" : "No",
        r.scannedAt ? format(new Date(r.scannedAt), "dd/MM/yyyy HH:mm") : "",
      ]),
    ]
    const csv = rows.map((row) => row.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/attendance">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-[#18181B]">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Attendance Records</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{total} total records</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="h-9 text-xs border-[#E8E5E1] gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="w-48 h-9 border-[#E8E5E1] text-sm">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All companies</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.companyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRound} onValueChange={setFilterRound}>
          <SelectTrigger className="w-44 h-9 border-[#E8E5E1] text-sm">
            <SelectValue placeholder="All rounds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All rounds</SelectItem>
            {rounds.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={scannedOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setScannedOnly((p) => !p)}
          className={`h-9 text-xs ${scannedOnly ? "bg-[#18181B] text-white" : "border-[#E8E5E1]"}`}
        >
          Attended only
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E8E5E1] bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-sm">Loading…</div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E5E1] bg-zinc-50/60">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">USN</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Round</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">Scanned At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE8]">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#18181B] text-sm">{r.student.name}</p>
                      <p className="text-xs text-zinc-500">{r.student.branch}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-zinc-600">{r.student.usn ?? "—"}</td>
                    <td className="px-5 py-3">
                      {r.job ? (
                        <>
                          <p className="text-sm text-[#18181B]">{r.job.company}</p>
                          <p className="text-xs text-zinc-500">{r.job.title}</p>
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full border border-[#E8E5E1] px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                        {r.round ?? "General"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.scannedAt ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          ✓ Attended
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {r.scannedAt ? format(new Date(r.scannedAt), "dd MMM yyyy, hh:mm a") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
