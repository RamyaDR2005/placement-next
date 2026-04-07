"use client"

import { useState, useRef, useCallback } from "react"
import { QrReader } from "react-qr-reader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Users, Check, X, Camera } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  companyName: string
}

interface Session {
  jobId: string
  round: string
  job: { companyName: string; title: string } | null
  total: number
  scanned: number
}

interface ScanResult {
  success: boolean
  alreadyScanned?: boolean
  message: string
  student?: { name: string; usn: string; branch: string }
  job?: { title: string; company: string }
  round?: string
}

export function AdminAttendanceView({
  jobs,
  sessions,
}: {
  jobs: Job[]
  sessions: Session[]
}) {
  // Session creation
  const [selectedJobId, setSelectedJobId] = useState("")
  const [roundName, setRoundName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Scanner
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanning2, setScanning2] = useState(false)
  const lastScanned = useRef<string>("")

  const handleCreateSession = async () => {
    if (!selectedJobId || !roundName.trim()) return
    setCreating(true)
    setCreateMsg(null)
    try {
      const res = await fetch("/api/attendance/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId, round: roundName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreateMsg({ type: "success", text: data.message })
        setRoundName("")
        setSelectedJobId("")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setCreateMsg({ type: "error", text: data.error })
      }
    } catch {
      setCreateMsg({ type: "error", text: "Network error" })
    } finally {
      setCreating(false)
    }
  }

  const handleScan = useCallback(
    async (result: string | null) => {
      if (!result || result === lastScanned.current || scanning2) return
      lastScanned.current = result
      setScanning2(true)
      setScanResult(null)

      try {
        const res = await fetch("/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: result }),
        })
        const data: ScanResult = await res.json()
        setScanResult(data)
      } catch {
        setScanResult({ success: false, message: "Network error during scan" })
      } finally {
        setTimeout(() => {
          setScanning2(false)
          lastScanned.current = ""
        }, 3000)
      }
    },
    [scanning2]
  )

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Attendance Scan</h1>
          <p className="mt-1 text-sm text-zinc-500">Create rounds, scan student QR codes, and track attendance</p>
        </div>
        <Link href="/admin/attendance/list">
          <Button variant="outline" size="sm" className="h-9 text-xs border-[#E8E5E1] gap-1.5">
            <Users className="h-3.5 w-3.5" /> View All Records
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Create Session */}
        <div className="rounded-2xl border border-[#E8E5E1] bg-white p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#18181B] flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Create Attendance Session
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select a job and enter a round name to generate QR codes for eligible students.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-700">Company / Job</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="h-9 text-sm border-[#E8E5E1]">
                <SelectValue placeholder="Select a job posting" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.companyName} — {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-700">Round Name</Label>
            <Input
              placeholder="e.g. Round 1 - Aptitude Test"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              className="h-9 text-sm border-[#E8E5E1]"
            />
          </div>
          {createMsg && (
            <Alert variant={createMsg.type === "error" ? "destructive" : "default"}>
              <AlertDescription className="text-sm">{createMsg.text}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleCreateSession}
            disabled={!selectedJobId || !roundName.trim() || creating}
            className="w-full h-9 bg-[#18181B] hover:bg-zinc-800 text-white text-sm"
          >
            {creating ? "Creating…" : "Create Session"}
          </Button>
        </div>

        {/* QR Scanner */}
        <div className="rounded-2xl border border-[#E8E5E1] bg-white p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#18181B] flex items-center gap-1.5">
              <Camera className="h-4 w-4" /> Scan QR Code
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Point the camera at a student's QR code to mark attendance.
            </p>
          </div>
          {!scanning ? (
            <Button
              onClick={() => { setScanning(true); setScanResult(null) }}
              className="w-full gap-2 h-9 bg-[#18181B] hover:bg-zinc-800 text-white text-sm"
            >
              <Camera className="h-4 w-4" /> Open Camera
            </Button>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden border border-[#E8E5E1]">
                <QrReader
                  onResult={(result) => { if (result) handleScan(result.getText()) }}
                  constraints={{ facingMode: "environment" }}
                  className="w-full"
                />
              </div>
              <Button variant="outline" onClick={() => setScanning(false)} className="w-full h-9 text-sm border-[#E8E5E1]">
                Close Camera
              </Button>
            </>
          )}

          {scanResult && (
            <div className={`rounded-xl border p-4 space-y-2 ${
              scanResult.success
                ? "border-emerald-200 bg-emerald-50"
                : scanResult.alreadyScanned
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-center gap-2 font-medium text-sm">
                {scanResult.success
                  ? <Check className="h-4 w-4 text-emerald-600" />
                  : <X className="h-4 w-4 text-red-600" />
                }
                {scanResult.message}
              </div>
              {scanResult.student && (
                <div className="text-sm space-y-0.5">
                  <p className="font-medium text-[#18181B]">{scanResult.student.name}</p>
                  <p className="text-xs text-zinc-500">
                    {scanResult.student.usn} · {scanResult.student.branch}
                  </p>
                  {scanResult.job && (
                    <p className="text-xs text-zinc-500">{scanResult.job.company} — {scanResult.round}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Active Sessions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <div key={`${s.jobId}:${s.round}`} className="rounded-2xl border border-[#E8E5E1] bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[#18181B]">{s.job?.companyName ?? s.jobId}</p>
                    <p className="text-xs text-zinc-500">{s.job?.title}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-full border border-[#E8E5E1] px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                    {s.round || "General"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{s.scanned} / {s.total} attended</span>
                    <span className="font-medium text-zinc-700">
                      {s.total > 0 ? Math.round((s.scanned / s.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: s.total > 0 ? `${(s.scanned / s.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
