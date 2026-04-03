"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Download, Search, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface CompanyRow {
  companyName: string
  jobCount: number
  jobIds: string[]
  roles: string[]
  totalApplications: number
  shortlisted: number
  selected: number
  avgPackage: number | null
  latestDate: string | null
}

interface CompanyAnalyticsTableProps {
  companies: CompanyRow[]
  batchId?: string
}

export function CompanyAnalyticsTable({ companies, batchId }: CompanyAnalyticsTableProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<CompanyRow | null>(null)

  const filtered = companies.filter((c) =>
    !search || c.companyName.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    const qs = new URLSearchParams()
    if (batchId) qs.set("batchId", batchId)
    window.location.href = `/api/admin/analytics/companies/export?${qs}`
  }

  const conversionRate = (c: CompanyRow) =>
    c.totalApplications > 0 ? Math.round((c.selected / c.totalApplications) * 100) : 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>All Companies</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-56"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Roles</TableHead>
                <TableHead className="text-right">Applications</TableHead>
                <TableHead className="text-right">Shortlisted</TableHead>
                <TableHead className="text-right">Selected</TableHead>
                <TableHead className="text-right">Conversion</TableHead>
                <TableHead className="text-right">Avg Package</TableHead>
                <TableHead className="text-right">Last Posted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.companyName} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(c)}>
                    <TableCell className="font-medium">{c.companyName}</TableCell>
                    <TableCell className="text-right">{c.jobCount}</TableCell>
                    <TableCell className="text-right">{c.totalApplications}</TableCell>
                    <TableCell className="text-right">{c.shortlisted}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 font-medium">{c.selected}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={conversionRate(c) >= 20 ? "default" : "secondary"}>
                        {conversionRate(c)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.avgPackage ? `${c.avgPackage} LPA` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {c.latestDate ? format(new Date(c.latestDate), "d MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>{selected.companyName}</SheetTitle>
                <SheetDescription>
                  {selected.jobCount} role{selected.jobCount !== 1 ? "s" : ""} posted
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Applications", value: selected.totalApplications },
                    { label: "Shortlisted", value: selected.shortlisted },
                    { label: "Selected", value: selected.selected },
                    { label: "Conversion", value: `${conversionRate(selected)}%` },
                    { label: "Avg Package", value: selected.avgPackage ? `${selected.avgPackage} LPA` : "—" },
                    { label: "Last Posted", value: selected.latestDate ? format(new Date(selected.latestDate), "d MMM yyyy") : "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-lg font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Roles */}
                <div>
                  <p className="text-sm font-medium mb-2">Roles Posted</p>
                  <div className="space-y-1">
                    {selected.roles.map((role, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border rounded px-3 py-1.5">
                        <span>{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application pipeline bar */}
                {selected.totalApplications > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">Application Pipeline</p>
                    <div className="space-y-2">
                      {[
                        { label: "Applied", value: selected.totalApplications, color: "bg-neutral-200" },
                        { label: "Shortlisted", value: selected.shortlisted, color: "bg-blue-400" },
                        { label: "Selected", value: selected.selected, color: "bg-green-500" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          <span className="w-24 text-muted-foreground shrink-0">{label}</span>
                          <div className="flex-1 bg-neutral-100 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.round((value / selected.totalApplications) * 100)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
