"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Download, Filter } from "lucide-react"
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
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/attendance">
            <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1>
            <p className="text-sm text-muted-foreground">{total} total records</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={filterJob} onValueChange={setFilterJob}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All companies</SelectItem>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRound} onValueChange={setFilterRound}>
              <SelectTrigger className="w-52">
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
            >
              Attended only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-neutral-50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">USN</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Round</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Scanned At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.student.name}</p>
                        <p className="text-xs text-muted-foreground">{r.student.branch}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.student.usn ?? "—"}</td>
                      <td className="px-4 py-3">
                        {r.job ? (
                          <>
                            <p>{r.job.company}</p>
                            <p className="text-xs text-muted-foreground">{r.job.title}</p>
                          </>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {r.round ?? "General"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.scannedAt ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✓ Attended</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Pending</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.scannedAt ? format(new Date(r.scannedAt), "dd MMM yyyy, hh:mm a") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
