"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Users, Plus, Archive, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Batch {
  id: string
  name: string
  admissionYear: string
  collegeCode: string
  status: "SETUP" | "ACTIVE" | "ARCHIVED"
  startedAt: string | null
  archivedAt: string | null
  createdAt: string
  _count: { students: number }
  creator: { name: string | null; email: string }
}

interface BatchManagementViewProps {
  batches: Batch[]
  activeCount: number
  maxActiveBatches: number
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ACTIVE: { label: "Active", variant: "default" },
  SETUP: { label: "Setup", variant: "secondary" },
  ARCHIVED: { label: "Archived", variant: "outline" },
}

export function BatchManagementView({ batches, activeCount, maxActiveBatches }: BatchManagementViewProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [freshStartOpen, setFreshStartOpen] = useState<string | null>(null)

  // Create form
  const [newName, setNewName] = useState("")
  const [newYear, setNewYear] = useState("")
  const [newCollegeCode, setNewCollegeCode] = useState("2SD")

  // Fresh start form
  const [fsName, setFsName] = useState("")
  const [fsYear, setFsYear] = useState("")

  const handleCreate = async () => {
    if (!newName.trim() || !newYear.trim()) {
      toast.error("Name and admission year are required")
      return
    }
    if (!/^\d{2}$/.test(newYear)) {
      toast.error("Admission year must be 2 digits (e.g. 22)")
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), admissionYear: newYear, collegeCode: newCollegeCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to create batch")
      toast.success(`Batch "${data.batch.name}" created`)
      setCreateOpen(false)
      setNewName("")
      setNewYear("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create batch")
    } finally {
      setIsCreating(false)
    }
  }

  const handleStatusChange = async (batchId: string, status: "ACTIVE" | "ARCHIVED") => {
    try {
      const res = await fetch(`/api/admin/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to update batch")
      toast.success(status === "ACTIVE" ? "Batch activated" : "Batch archived")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update batch")
    }
  }

  const handleFreshStart = async (batchId: string) => {
    if (!fsName.trim() || !fsYear.trim()) {
      toast.error("New batch name and year are required")
      return
    }
    if (!/^\d{2}$/.test(fsYear)) {
      toast.error("Year must be 2 digits (e.g. 26)")
      return
    }

    try {
      const res = await fetch(`/api/admin/batches/${batchId}/fresh-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBatchName: fsName.trim(), newAdmissionYear: fsYear }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed")
      toast.success(`Archived "${data.archivedBatch.name}" → created "${data.newBatch.name}"`)
      setFreshStartOpen(null)
      setFsName("")
      setFsYear("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fresh start failed")
    }
  }

  const activeBatches = batches.filter((b) => b.status === "ACTIVE")
  const setupBatches = batches.filter((b) => b.status === "SETUP")
  const archivedBatches = batches.filter((b) => b.status === "ARCHIVED")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {activeCount} of {maxActiveBatches} active batches. Archive a batch before activating a new one.
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>
                A new batch starts in SETUP status. Activate it when ready.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="batch-name">Batch Name</Label>
                <Input
                  id="batch-name"
                  placeholder="e.g. 2022-2026"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-year">Admission Year (2 digits)</Label>
                <Input
                  id="batch-year"
                  placeholder="e.g. 22"
                  maxLength={2}
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batch-college">College Code</Label>
                <Input
                  id="batch-college"
                  placeholder="e.g. 2SD"
                  value={newCollegeCode}
                  onChange={(e) => setNewCollegeCode(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating…" : "Create Batch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Batches */}
      {activeBatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active</h3>
          {activeBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              onArchive={() => handleStatusChange(batch.id, "ARCHIVED")}
              onFreshStart={() => {
                setFreshStartOpen(batch.id)
                setFsName("")
                setFsYear("")
              }}
              freshStartOpen={freshStartOpen === batch.id}
              onFreshStartClose={() => setFreshStartOpen(null)}
              onFreshStartSubmit={() => handleFreshStart(batch.id)}
              fsName={fsName}
              setFsName={setFsName}
              fsYear={fsYear}
              setFsYear={setFsYear}
            />
          ))}
        </div>
      )}

      {/* Setup Batches */}
      {setupBatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Setup (Pending Activation)</h3>
          {setupBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              canActivate={activeCount < maxActiveBatches}
              onActivate={() => handleStatusChange(batch.id, "ACTIVE")}
              onArchive={() => handleStatusChange(batch.id, "ARCHIVED")}
            />
          ))}
        </div>
      )}

      {/* Archived Batches */}
      {archivedBatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Archived</h3>
          {archivedBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}

      {batches.length === 0 && (
        <div className="rounded-2xl border border-[#E8E5E1] bg-white py-12 text-center text-sm text-zinc-500">
          No batches yet. Create one to get started.
        </div>
      )}
    </div>
  )
}

interface BatchCardProps {
  batch: Batch
  canActivate?: boolean
  onActivate?: () => void
  onArchive?: () => void
  onFreshStart?: () => void
  freshStartOpen?: boolean
  onFreshStartClose?: () => void
  onFreshStartSubmit?: () => void
  fsName?: string
  setFsName?: (v: string) => void
  fsYear?: string
  setFsYear?: (v: string) => void
}

function BatchCard({
  batch,
  canActivate,
  onActivate,
  onArchive,
  onFreshStart,
  freshStartOpen,
  onFreshStartClose,
  onFreshStartSubmit,
  fsName = "",
  setFsName,
  fsYear = "",
  setFsYear,
}: BatchCardProps) {
  const badgeInfo = STATUS_BADGE[batch.status]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {batch.name}
              <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Admission year: {batch.admissionYear} · Code: {batch.collegeCode}
              {batch.startedAt && ` · Active since ${new Date(batch.startedAt).toLocaleDateString()}`}
              {batch.archivedAt && ` · Archived ${new Date(batch.archivedAt).toLocaleDateString()}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{batch._count.students}</span>
          </div>
        </div>
      </CardHeader>

      {(onActivate || onArchive || onFreshStart) && (
        <CardContent className="pt-0 flex flex-wrap gap-2">
          {onActivate && batch.status === "SETUP" && (
            <Button
              size="sm"
              variant="default"
              onClick={onActivate}
              disabled={!canActivate}
              title={!canActivate ? "Max active batches reached — archive one first" : undefined}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Activate
            </Button>
          )}

          {onFreshStart && batch.status === "ACTIVE" && (
            <Dialog open={freshStartOpen} onOpenChange={(open) => !open && onFreshStartClose?.()}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" onClick={onFreshStart}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Fresh Start
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fresh Start for New Batch</DialogTitle>
                  <DialogDescription>
                    This will archive <strong>{batch.name}</strong> ({batch._count.students} students) and create a new batch in SETUP status.
                    All existing data is preserved for historical reporting.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label>New Batch Name</Label>
                    <Input
                      placeholder="e.g. 2026-2030"
                      value={fsName}
                      onChange={(e) => setFsName?.(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Admission Year (2 digits)</Label>
                    <Input
                      placeholder="e.g. 26"
                      maxLength={2}
                      value={fsYear}
                      onChange={(e) => setFsYear?.(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={onFreshStartClose}>Cancel</Button>
                  <Button onClick={onFreshStartSubmit}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start Fresh
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {onArchive && batch.status !== "ARCHIVED" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground">
                  <Archive className="w-3.5 h-3.5 mr-1.5" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive {batch.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The batch and its {batch._count.students} students will be archived. This can be reversed only by contacting support. Use Fresh Start instead if you are starting a new academic batch.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onArchive}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {batch.status === "ARCHIVED" && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Read-only — preserved for historical reporting
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
