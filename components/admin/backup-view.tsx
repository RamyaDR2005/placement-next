"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
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
import { Download, Loader2, Database } from "lucide-react"

interface BackupLogEntry {
  id: string
  adminId: string
  batchYear: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  recordCount: number
  fileSize: number | null
  fields: string[]
  errorMessage: string | null
  createdAt: Date | string
  completedAt: Date | string | null
  admin: {
    name: string | null
    email: string | null
  }
}

interface BackupViewProps {
  initialLogs: BackupLogEntry[]
}

const SHEET_OPTIONS = [
  { id: "profiles", label: "Profiles" },
  { id: "applications", label: "Applications" },
  { id: "placements", label: "Placements" },
  { id: "attendance", label: "Attendance" },
] as const

const BATCH_YEARS = [
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
]

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default"
    case "PENDING":
      return "secondary"
    case "FAILED":
      return "destructive"
    default:
      return "outline"
  }
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BackupView({ initialLogs }: BackupViewProps) {
  const [batchYear, setBatchYear] = useState("2022")
  const [selectedSheets, setSelectedSheets] = useState<string[]>(
    SHEET_OPTIONS.map((s) => s.id)
  )
  const [isExporting, setIsExporting] = useState(false)
  const [logs, setLogs] = useState<BackupLogEntry[]>(initialLogs)

  function handleSheetToggle(sheetId: string, checked: boolean) {
    setSelectedSheets((prev) =>
      checked ? [...prev, sheetId] : prev.filter((id) => id !== sheetId)
    )
  }

  async function handleExport() {
    if (selectedSheets.length === 0) return

    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchYear,
          includeSheets: selectedSheets,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error ?? "Export failed")
      }

      // Trigger browser download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download =
        response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ??
        `backup-${batchYear}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Refresh history
      const historyResponse = await fetch("/api/admin/backup/history")
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setLogs(historyData.data)
      }
    } catch (err) {
      console.error("Export failed:", err)
      // Refresh history to show failed entry
      const historyResponse = await fetch("/api/admin/backup/history")
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setLogs(historyData.data)
      }
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Data Backup</h1>
          <p className="text-muted-foreground">
            Export annual batch data as XLSX
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Export Batch Data
            </CardTitle>
            <CardDescription>
              Select a batch year and the data sheets to include in the export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Batch Year Selector */}
            <div className="space-y-2">
              <Label htmlFor="batch-year">Batch Year</Label>
              <Select value={batchYear} onValueChange={setBatchYear}>
                <SelectTrigger className="w-[200px]" id="batch-year">
                  <SelectValue placeholder="Select batch year" />
                </SelectTrigger>
                <SelectContent>
                  {BATCH_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sheet Checkboxes */}
            <div className="space-y-2">
              <Label>Include Sheets</Label>
              <div className="flex flex-wrap gap-4">
                {SHEET_OPTIONS.map((sheet) => (
                  <div key={sheet.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`sheet-${sheet.id}`}
                      checked={selectedSheets.includes(sheet.id)}
                      onCheckedChange={(checked) =>
                        handleSheetToggle(sheet.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`sheet-${sheet.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {sheet.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedSheets.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </CardContent>
        </Card>

        {/* History Section */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>Recent data export logs</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No backup history yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Batch Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Sheets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {log.admin.name ?? log.admin.email ?? "Unknown"}
                      </TableCell>
                      <TableCell>{log.batchYear}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.recordCount}</TableCell>
                      <TableCell>{formatFileSize(log.fileSize)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {log.fields.map((field) => (
                            <Badge
                              key={field}
                              variant="outline"
                              className="text-xs"
                            >
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
