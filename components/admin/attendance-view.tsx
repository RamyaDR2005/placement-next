"use client"

import { useState, useRef, useCallback } from "react"
import { QrReader } from "react-qr-reader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Plus, Users, Check, X, Camera } from "lucide-react"
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
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create rounds, scan student QR codes, and track attendance.
          </p>
        </div>
        <Link href="/admin/attendance/list">
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" /> View All Records
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Session */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Attendance Session
            </CardTitle>
            <CardDescription>
              Select a job and enter a round name. This will generate QR codes for all eligible students.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company / Job</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
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
              <Label>Round Name</Label>
              <Input
                placeholder="e.g. Round 1 - Aptitude Test"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
              />
            </div>
            {createMsg && (
              <Alert variant={createMsg.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{createMsg.text}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleCreateSession}
              disabled={!selectedJobId || !roundName.trim() || creating}
              className="w-full"
            >
              {creating ? "Creating…" : "Create Session"}
            </Button>
          </CardContent>
        </Card>

        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" /> Scan QR Code
            </CardTitle>
            <CardDescription>
              Point the camera at a student's QR code to mark attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scanning ? (
              <Button onClick={() => { setScanning(true); setScanResult(null) }} className="w-full gap-2">
                <Camera className="h-4 w-4" /> Open Camera
              </Button>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden border">
                  <QrReader
                    onResult={(result) => {
                      if (result) handleScan(result.getText())
                    }}
                    constraints={{ facingMode: "environment" }}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" onClick={() => setScanning(false)} className="w-full">
                  Close Camera
                </Button>
              </>
            )}

            {scanResult && (
              <div
                className={`rounded-lg border p-4 space-y-2 ${
                  scanResult.success
                    ? "border-green-200 bg-green-50"
                    : scanResult.alreadyScanned
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  {scanResult.success ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  {scanResult.message}
                </div>
                {scanResult.student && (
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{scanResult.student.name}</p>
                    <p className="text-muted-foreground">
                      {scanResult.student.usn} · {scanResult.student.branch}
                    </p>
                    {scanResult.job && (
                      <p className="text-muted-foreground">
                        {scanResult.job.company} — {scanResult.round}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Sessions */}
      {sessions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <Card key={`${s.jobId}:${s.round}`}>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{s.job?.companyName ?? s.jobId}</p>
                      <p className="text-xs text-muted-foreground">{s.job?.title}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{s.round || "General"}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.scanned} / {s.total} attended</span>
                    <div className="h-2 w-24 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: s.total > 0 ? `${(s.scanned / s.total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
