"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, ShieldCheck, Globe } from "lucide-react"

const ADMISSION_YEARS = ["20", "21", "22", "23", "24", "25", "26"] as const

interface AdminSettingsProps {
  adminSettings: {
    activeAdmissionYears: string[]
    collegeCode: string
  }
  siteSettings: {
    placementSeasonName: string
    activeBatch: string
    announcementText: string | null
    announcementActive: boolean
    registrationOpen: boolean
  }
}

export function AdminSettingsView({
  adminSettings: initialAdminSettings,
  siteSettings: initialSiteSettings,
}: AdminSettingsProps) {
  // Batch Access Control state
  const [activeYears, setActiveYears] = useState<string[]>(
    initialAdminSettings.activeAdmissionYears
  )
  const [collegeCode, setCollegeCode] = useState(
    initialAdminSettings.collegeCode
  )
  const [savingAdmin, setSavingAdmin] = useState(false)

  // Site Configuration state
  const [placementSeasonName, setPlacementSeasonName] = useState(
    initialSiteSettings.placementSeasonName
  )
  const [activeBatch, setActiveBatch] = useState(
    initialSiteSettings.activeBatch
  )
  const [announcementText, setAnnouncementText] = useState(
    initialSiteSettings.announcementText ?? ""
  )
  const [announcementActive, setAnnouncementActive] = useState(
    initialSiteSettings.announcementActive
  )
  const [registrationOpen, setRegistrationOpen] = useState(
    initialSiteSettings.registrationOpen
  )
  const [savingSite, setSavingSite] = useState(false)

  function handleYearToggle(year: string, checked: boolean) {
    setActiveYears((prev) =>
      checked ? [...prev, year] : prev.filter((y) => y !== year)
    )
  }

  async function saveAdminSettings() {
    if (activeYears.length === 0) {
      toast.error("At least one admission year must be selected")
      return
    }

    setSavingAdmin(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin",
          data: {
            activeAdmissionYears: activeYears,
            collegeCode,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings")
      }

      toast.success("Batch access control settings saved")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings"
      )
    } finally {
      setSavingAdmin(false)
    }
  }

  async function saveSiteSettings() {
    setSavingSite(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "site",
          data: {
            placementSeasonName,
            activeBatch,
            announcementText: announcementText || null,
            announcementActive,
            registrationOpen,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings")
      }

      toast.success("Site configuration saved")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings"
      )
    } finally {
      setSavingSite(false)
    }
  }

  const previewYear = activeYears.length > 0 ? activeYears[0] : "XX"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage batch access control and site configuration
        </p>
      </div>

      <Tabs defaultValue="batch" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batch" className="gap-2">
            <ShieldCheck className="size-4" />
            Batch Access Control
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2">
            <Globe className="size-4" />
            Site Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Access Control</CardTitle>
              <CardDescription>
                Control which admission year batches can access the portal.
                Students are identified by their USN pattern.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Active Admission Years
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select which admission year batches should have access to the
                  placement portal.
                </p>
                <div className="flex flex-wrap gap-4">
                  {ADMISSION_YEARS.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={activeYears.includes(year)}
                        onCheckedChange={(checked) =>
                          handleYearToggle(year, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`year-${year}`}
                        className="cursor-pointer font-normal"
                      >
                        20{year}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeCode">College Code</Label>
                <Input
                  id="collegeCode"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  placeholder="2SD"
                  className="max-w-xs"
                  maxLength={4}
                />
                <p className="text-sm text-muted-foreground">
                  The college code prefix used in USN numbers (2-4 characters).
                </p>
              </div>

              <div className="rounded-md border bg-muted/50 p-4">
                <p className="text-sm font-medium">USN Access Preview</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Students with USNs like{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                    {collegeCode}
                    {previewYear}XXYYY
                  </code>{" "}
                  will have access
                </p>
                {activeYears.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeYears
                      .sort()
                      .map((year) => (
                        <span
                          key={year}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {collegeCode}{year}XXYYY
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <Button
                onClick={saveAdminSettings}
                disabled={savingAdmin || activeYears.length === 0}
              >
                {savingAdmin ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save Batch Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Configure placement season details, announcements, and
                registration status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="placementSeasonName">
                  Placement Season Name
                </Label>
                <Input
                  id="placementSeasonName"
                  value={placementSeasonName}
                  onChange={(e) => setPlacementSeasonName(e.target.value)}
                  placeholder="Placement Season 2025-26"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activeBatch">Active Batch</Label>
                <Input
                  id="activeBatch"
                  value={activeBatch}
                  onChange={(e) => setActiveBatch(e.target.value)}
                  placeholder="2022 - 2026"
                  className="max-w-md"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcementText">Announcement Text</Label>
                <Textarea
                  id="announcementText"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Enter an announcement to display to all users..."
                  className="max-w-md"
                  maxLength={500}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  {announcementText.length}/500 characters
                </p>
              </div>

              <div className="flex items-center justify-between rounded-md border p-4 max-w-md">
                <div className="space-y-0.5">
                  <Label htmlFor="announcementActive">
                    Announcement Active
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show the announcement banner to all users
                  </p>
                </div>
                <Switch
                  id="announcementActive"
                  checked={announcementActive}
                  onCheckedChange={setAnnouncementActive}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-4 max-w-md">
                <div className="space-y-0.5">
                  <Label htmlFor="registrationOpen">Registration Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {registrationOpen
                      ? "New student registrations are open"
                      : "New student registrations are closed"}
                  </p>
                </div>
                <Switch
                  id="registrationOpen"
                  checked={registrationOpen}
                  onCheckedChange={setRegistrationOpen}
                />
              </div>

              <Button
                onClick={saveSiteSettings}
                disabled={
                  savingSite ||
                  !placementSeasonName.trim() ||
                  !activeBatch.trim()
                }
              >
                {savingSite ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save Site Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
