"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"


interface Batch { id: string; name: string }
interface Placement { id: string; tier: string; companyName: string; salary: number }
interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  isComplete: boolean
  kycStatus: string
  usn: string | null
  branch: string | null
  batch: string | null
  callingMobile: string | null
  finalCgpa: number | null
  cgpa: number | null
  verifiedAt: Date | null
  createdAt: Date
}
interface Student {
  id: string
  name: string | null
  email: string
  createdAt: Date
  profile: Profile | null
  placements: Placement[]
  _count: { applications: number }
}
interface Filters {
  q: string
  kycStatus: string
  branch: string
  batchId: string
  placed: string
}

interface StudentsFilterTableProps {
  students: Student[]
  adminId: string
  totalCount: number
  totalPages: number
  currentPage: number
  activeBatches: Batch[]
  branches: string[]
  exportUrl: string
  filters: Filters
}

const KYC_COLORS: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  INCOMPLETE: "bg-gray-100 text-gray-800",
}

// use-debounce may not be installed; implement inline if needed
function useDebounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timer) clearTimeout(timer)
      setTimer(setTimeout(() => fn(...args), delay))
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, delay]
  )
}

export function StudentsFilterTable({
  students,
  totalCount,
  totalPages,
  currentPage,
  activeBatches,
  branches,
  exportUrl,
  filters,
}: StudentsFilterTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const pushFilter = useCallback(
    (updates: Partial<Filters> & { page?: number }) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v && v !== "" && v !== "all") {
          params.set(k, String(v))
        } else {
          params.delete(k)
        }
      })
      // Reset to page 1 on filter change (unless explicitly setting page)
      if (!("page" in updates)) params.delete("page")
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [pathname, router, searchParams]
  )

  const debouncedSearch = useDebounce((value: string) => {
    pushFilter({ q: value })
  }, 300)

  const hasFilters =
    filters.q || filters.kycStatus || filters.branch || filters.batchId || filters.placed

  const clearFilters = () => {
    startTransition(() => router.push(pathname))
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, USN, email..."
            defaultValue={filters.q}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-8 w-64"
          />
        </div>

        {activeBatches.length > 0 && (
          <Select value={filters.batchId || "all"} onValueChange={(v) => pushFilter({ batchId: v })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {activeBatches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filters.kycStatus || "all"} onValueChange={(v) => pushFilter({ kycStatus: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="KYC Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.branch || "all"} onValueChange={(v) => pushFilter({ branch: v })}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.placed || "all"} onValueChange={(v) => pushFilter({ placed: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Placement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="yes">Placed</SelectItem>
            <SelectItem value="no">Unplaced</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{totalCount} students</span>
          <Button variant="outline" size="sm" asChild>
            <a href={exportUrl} download>
              <Download className="w-4 h-4 mr-1" />
              Export
            </a>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>USN</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                  No students match the current filters
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => {
                const name =
                  s.name ??
                  (`${s.profile?.firstName ?? ""} ${s.profile?.lastName ?? ""}`.trim() ||
                  s.email)
                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                const topPlacement = s.placements[0]
                const cgpa = s.profile?.finalCgpa ?? (s.profile?.cgpa ?? null)

                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-tight">{name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.profile?.usn ?? "—"}</TableCell>
                    <TableCell className="text-sm">{s.profile?.branch ?? "—"}</TableCell>
                    <TableCell className="text-sm">{cgpa ? cgpa.toFixed(2) : "—"}</TableCell>
                    <TableCell>
                      <Badge className={KYC_COLORS[s.profile?.kycStatus ?? "PENDING"] ?? ""}>
                        {s.profile?.kycStatus ?? "PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-center">{s._count.applications}</TableCell>
                    <TableCell>
                      {topPlacement ? (
                        <div>
                          <p className="text-xs font-medium text-green-600">{topPlacement.companyName}</p>
                          <p className="text-xs text-muted-foreground">{topPlacement.salary} LPA</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unplaced</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(s.createdAt), "d MMM yyyy")}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => pushFilter({ page: currentPage - 1 })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => pushFilter({ page: currentPage + 1 })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
