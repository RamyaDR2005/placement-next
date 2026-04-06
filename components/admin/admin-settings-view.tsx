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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, ShieldCheck, Globe } from "lucide-react"

interface AdminSettingsProps {
  adminSettings: {
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
  // Admin settings state
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

  async function saveAdminSettings() {
    setSavingAdmin(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin",
          data: { collegeCode },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings")
      }

      toast.success("System settings saved")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and site settings
        </p>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system" className="gap-2">
            <ShieldCheck className="size-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="site" className="gap-2">
            <Globe className="size-4" />
            Site Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-level settings. Batch access is managed via{" "}
                <a href="/admin/batches" className="underline underline-offset-4 hover:text-foreground">
                  Batch Management
                </a>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  The college code prefix used in USN numbers (2–4 characters).
                </p>
              </div>

              <Button
                onClick={saveAdminSettings}
                disabled={savingAdmin || !collegeCode.trim()}
              >
                {savingAdmin ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save System Settings
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
