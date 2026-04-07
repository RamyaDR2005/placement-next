"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { Trophy, Search, Plus, Trash2, IndianRupee, Users } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Placement {
    id: string
    salary: number
    companyName: string
    tier: string
    isException: boolean
    exceptionNote: string | null
    createdAt: string
    user: {
        id: string
        name: string | null
        email: string
        profile: {
            firstName: string | null
            lastName: string | null
            usn: string | null
            branch: string | null
            batch: string | null
        } | null
    }
}

interface TierStat {
    tier: string
    _count: { tier: number }
    _avg: { salary: number | null }
}

interface StudentOption {
    id: string
    name: string | null
    email: string
    profile: {
        usn: string | null
        branch: string | null
        batch: string | null
        firstName: string | null
        lastName: string | null
    } | null
}

interface JobOption {
    id: string
    title: string
    companyName: string
    salary: number
    tier: string
}

const TIER_LABELS: Record<string, string> = {
    TIER_1: "Tier 1 (>9 LPA)",
    TIER_2: "Tier 2 (5–9 LPA)",
    TIER_3: "Tier 3 (≤5 LPA)",
    DREAM: "Dream (>10 LPA)",
}

const TIER_COLORS: Record<string, string> = {
    TIER_1: "bg-blue-100 text-blue-800",
    TIER_2: "bg-green-100 text-green-800",
    TIER_3: "bg-yellow-100 text-yellow-800",
    DREAM: "bg-purple-100 text-purple-800",
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

export function PlacementManagementView() {
    const [placements, setPlacements] = useState<Placement[]>([])
    const [tierStats, setTierStats] = useState<TierStat[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    // Filters
    const [filterTier, setFilterTier] = useState("ALL")
    const [filterBatch, setFilterBatch] = useState("")
    const [search, setSearch] = useState("")

    // Record placement dialog
    const [showDialog, setShowDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [studentQuery, setStudentQuery] = useState("")
    const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null)
    const [studentOptions, setStudentOptions] = useState<StudentOption[]>([])
    const [jobQuery, setJobQuery] = useState("")
    const [selectedJob, setSelectedJob] = useState<JobOption | null>(null)
    const [jobOptions, setJobOptions] = useState<JobOption[]>([])
    const [salary, setSalary] = useState("")
    const [companyName, setCompanyName] = useState("")
    const [isException, setIsException] = useState(false)
    const [exceptionNote, setExceptionNote] = useState("")

    const debouncedStudentQuery = useDebounce(studentQuery, 300)
    const debouncedJobQuery = useDebounce(jobQuery, 300)

    const fetchPlacements = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(filterTier !== "ALL" && { tier: filterTier }),
                ...(filterBatch && { batch: filterBatch }),
                ...(search && { search }),
            })
            const res = await fetch(`/api/admin/placements?${params}`)
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setPlacements(data.data.placements)
            setTierStats(data.data.stats)
            setTotal(data.data.pagination.total)
            setTotalPages(data.data.pagination.pages)
        } catch {
            toast.error("Failed to load placements")
        } finally {
            setIsLoading(false)
        }
    }, [page, filterTier, filterBatch, search])

    useEffect(() => {
        fetchPlacements()
    }, [fetchPlacements])

    // Student autocomplete
    useEffect(() => {
        if (debouncedStudentQuery.length < 2) {
            setStudentOptions([])
            return
        }
        fetch(`/api/admin/students?search=${encodeURIComponent(debouncedStudentQuery)}&limit=8`)
            .then((r) => r.json())
            .then((d) => setStudentOptions(d.data?.students || []))
            .catch(() => {})
    }, [debouncedStudentQuery])

    // Job autocomplete
    useEffect(() => {
        if (debouncedJobQuery.length < 2) {
            setJobOptions([])
            return
        }
        fetch(`/api/admin/jobs?search=${encodeURIComponent(debouncedJobQuery)}&limit=8&status=ACTIVE`)
            .then((r) => r.json())
            .then((d) => setJobOptions(d.data?.jobs || []))
            .catch(() => {})
    }, [debouncedJobQuery])

    const handleSelectJob = (job: JobOption) => {
        setSelectedJob(job)
        setJobQuery(job.title)
        setJobOptions([])
        setCompanyName(job.companyName)
        setSalary(job.salary.toString())
    }

    const handleSelectStudent = (student: StudentOption) => {
        setSelectedStudent(student)
        setStudentQuery(
            student.profile?.usn ||
                student.name ||
                student.email
        )
        setStudentOptions([])
    }

    const handleRecordPlacement = async () => {
        if (!selectedStudent || !selectedJob || !salary || !companyName) {
            toast.error("Please fill all required fields")
            return
        }
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/placements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedStudent.id,
                    jobId: selectedJob.id,
                    salary: parseFloat(salary),
                    companyName,
                    isException,
                    exceptionNote: isException ? exceptionNote : undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to record")
            toast.success("Placement recorded successfully")
            setShowDialog(false)
            resetForm()
            fetchPlacements()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to record placement")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/placements?id=${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")
            toast.success("Placement record removed")
            fetchPlacements()
        } catch {
            toast.error("Failed to remove placement")
        }
    }

    const resetForm = () => {
        setStudentQuery("")
        setSelectedStudent(null)
        setStudentOptions([])
        setJobQuery("")
        setSelectedJob(null)
        setJobOptions([])
        setSalary("")
        setCompanyName("")
        setIsException(false)
        setExceptionNote("")
    }

    const totalPlaced = tierStats.reduce((acc, s) => acc + s._count.tier, 0)
    const avgPackage =
        tierStats.length > 0
            ? tierStats.reduce((acc, s) => acc + (s._avg.salary || 0) * s._count.tier, 0) /
              Math.max(totalPlaced, 1)
            : 0

    return (
        <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Placed", value: String(totalPlaced), icon: Users, color: "text-[#18181B]" },
                    { label: "Avg Package", value: `${avgPackage.toFixed(1)} LPA`, icon: IndianRupee, color: "text-blue-600" },
                    ...tierStats.filter((s) => ["DREAM", "TIER_1"].includes(s.tier)).map((stat) => ({
                        label: TIER_LABELS[stat.tier] ?? stat.tier,
                        value: String(stat._count.tier),
                        icon: Trophy,
                        color: stat.tier === "DREAM" ? "text-violet-600" : "text-emerald-600",
                        sub: `Avg ${(stat._avg.salary || 0).toFixed(1)} LPA`,
                    })),
                ].map(({ label, value, icon: Icon, color, sub }: any) => (
                    <div key={label} className="rounded-xl border border-[#E8E5E1] bg-white px-4 py-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-zinc-500 font-medium">{label}</p>
                            <Icon className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                        <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
                        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
                    </div>
                ))}
            </div>

            {/* Tier breakdown */}
            {tierStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["DREAM", "TIER_1", "TIER_2", "TIER_3"].map((tier) => {
                        const stat = tierStats.find((s) => s.tier === tier)
                        const colors: Record<string, string> = {
                            DREAM: "text-violet-600", TIER_1: "text-emerald-600",
                            TIER_2: "text-blue-600", TIER_3: "text-amber-600",
                        }
                        return (
                            <div key={tier} className="rounded-xl border border-[#E8E5E1] bg-white px-4 py-3 text-center">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">{TIER_LABELS[tier]?.split(" ")[0]}</p>
                                <p className={`text-2xl font-bold mt-1 tracking-tight ${colors[tier]}`}>{stat?._count.tier ?? 0}</p>
                                {stat && <p className="text-xs text-zinc-400">Avg {(stat._avg.salary || 0).toFixed(1)} LPA</p>}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Table with filters */}
            <div className="rounded-2xl border border-[#E8E5E1] bg-white overflow-hidden">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-[#E8E5E1] flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-[#18181B]">Placement Records</p>
                        <p className="text-xs text-zinc-500">{total} placement{total !== 1 ? "s" : ""} recorded</p>
                    </div>
                    <Button onClick={() => setShowDialog(true)} className="h-9 bg-[#18181B] hover:bg-zinc-800 text-white text-xs gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Record Placement
                    </Button>
                </div>

                <div className="px-5 py-3 border-b border-[#E8E5E1] flex flex-col sm:flex-row flex-wrap gap-2">
                    <div className="relative flex-1 min-w-0 sm:min-w-48">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search student or company..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            className="pl-10 h-9 border-[#E8E5E1] w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={filterTier} onValueChange={(v) => { setFilterTier(v); setPage(1) }}>
                            <SelectTrigger className="w-36 h-9 border-[#E8E5E1]">
                                <SelectValue placeholder="All Tiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Tiers</SelectItem>
                                <SelectItem value="DREAM">Dream</SelectItem>
                                <SelectItem value="TIER_1">Tier 1</SelectItem>
                                <SelectItem value="TIER_2">Tier 2</SelectItem>
                                <SelectItem value="TIER_3">Tier 3</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Batch (e.g. 2025)"
                            value={filterBatch}
                            onChange={(e) => { setFilterBatch(e.target.value); setPage(1) }}
                            className="w-32 h-9 border-[#E8E5E1]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                <div className="min-w-[650px]">
                    <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>USN / Branch</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : placements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12">
                                            <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">No placement records found</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    placements.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {p.user.profile?.firstName && p.user.profile?.lastName
                                                            ? `${p.user.profile.firstName} ${p.user.profile.lastName}`
                                                            : p.user.name || p.user.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{p.user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-mono text-xs">{p.user.profile?.usn || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.user.profile?.branch} · {p.user.profile?.batch}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {p.companyName}
                                                {p.isException && (
                                                    <Badge variant="outline" className="ml-2 text-xs">Exception</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">₹{p.salary} LPA</TableCell>
                                            <TableCell>
                                                <Badge className={TIER_COLORS[p.tier]}>
                                                    {p.tier.replace("_", " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(p.createdAt), "dd MMM yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remove placement?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently remove the placement record for{" "}
                                                                <strong>{p.user.name || p.user.email}</strong> at{" "}
                                                                <strong>{p.companyName}</strong>. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(p.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Remove
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 px-5 py-3 border-t border-[#E8E5E1]">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-8 text-xs border-[#E8E5E1]">
                            Previous
                        </Button>
                        <span className="flex items-center px-3 text-xs text-zinc-500">
                            Page {page} of {totalPages}
                        </span>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 text-xs border-[#E8E5E1]">
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Record Placement Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm() }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Record Placement</DialogTitle>
                        <DialogDescription>
                            Record a confirmed placement offer for a student.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Student search */}
                        <div className="space-y-1">
                            <Label>Student *</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Search by name, USN, or email..."
                                    value={studentQuery}
                                    onChange={(e) => {
                                        setStudentQuery(e.target.value)
                                        setSelectedStudent(null)
                                    }}
                                />
                                {studentOptions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                                        {studentOptions.map((s) => (
                                            <button
                                                key={s.id}
                                                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                                                onClick={() => handleSelectStudent(s)}
                                            >
                                                <p className="font-medium">
                                                    {s.profile?.firstName
                                                        ? `${s.profile.firstName} ${s.profile.lastName || ""}`
                                                        : s.name || s.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {s.profile?.usn} · {s.profile?.branch} · {s.email}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedStudent && (
                                <p className="text-xs text-green-600">
                                    Selected: {selectedStudent.profile?.usn || selectedStudent.email}
                                </p>
                            )}
                        </div>

                        {/* Job search */}
                        <div className="space-y-1">
                            <Label>Job *</Label>
                            <div className="relative">
                                <Input
                                    placeholder="Search job title or company..."
                                    value={jobQuery}
                                    onChange={(e) => {
                                        setJobQuery(e.target.value)
                                        setSelectedJob(null)
                                    }}
                                />
                                {jobOptions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                                        {jobOptions.map((j) => (
                                            <button
                                                key={j.id}
                                                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                                                onClick={() => handleSelectJob(j)}
                                            >
                                                <p className="font-medium">{j.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {j.companyName} · ₹{j.salary} LPA · {j.tier}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedJob && (
                                <p className="text-xs text-green-600">Selected: {selectedJob.title}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Salary (LPA) *</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="e.g. 12.5"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Company Name *</Label>
                                <Input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Auto-filled from job"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="exception"
                                checked={isException}
                                onCheckedChange={(v) => setIsException(!!v)}
                            />
                            <Label htmlFor="exception" className="cursor-pointer">
                                Mark as exception (bypasses tier lock)
                            </Label>
                        </div>

                        {isException && (
                            <div className="space-y-1">
                                <Label>Exception Note</Label>
                                <Textarea
                                    value={exceptionNote}
                                    onChange={(e) => setExceptionNote(e.target.value)}
                                    placeholder="Reason for exception..."
                                    rows={2}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowDialog(false); resetForm() }}>
                            Cancel
                        </Button>
                        <Button onClick={handleRecordPlacement} disabled={isSubmitting}>
                            {isSubmitting ? "Recording..." : "Record Placement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
