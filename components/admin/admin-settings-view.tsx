"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, ArrowRight } from "lucide-react"
import Link from "next/link"

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
  const [collegeCode, setCollegeCode] = useState(initialAdminSettings.collegeCode)
  const [savingAdmin, setSavingAdmin] = useState(false)

  const [placementSeasonName, setPlacementSeasonName] = useState(initialSiteSettings.placementSeasonName)
  const [activeBatch] = useState(initialSiteSettings.activeBatch)
  const [announcementText, setAnnouncementText] = useState(initialSiteSettings.announcementText ?? "")
  const [announcementActive, setAnnouncementActive] = useState(initialSiteSettings.announcementActive)
  const [registrationOpen, setRegistrationOpen] = useState(initialSiteSettings.registrationOpen)
  const [savingSite, setSavingSite] = useState(false)

  async function saveAdminSettings() {
    setSavingAdmin(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "admin", data: { collegeCode } }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to save settings")
      toast.success("System settings saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
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
      if (!response.ok) throw new Error(result.error || "Failed to save settings")
      toast.success("Site configuration saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setSavingSite(false)
    }
  }

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Site Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage system configuration and site-wide settings</p>
      </div>

      {/* System Settings */}
      <section className="rounded-2xl border border-[#E8E5E1] bg-white divide-y divide-[#E8E5E1]">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-[#18181B]">System</h2>
          <p className="text-xs text-zinc-500 mt-0.5">College-level configuration applied across the platform</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="collegeCode">College Code</Label>
            <Input
              id="collegeCode"
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value)}
              placeholder="2SD"
              className="max-w-xs border-[#E8E5E1]"
              maxLength={4}
            />
            <p className="text-xs text-zinc-500">The prefix used in student USN numbers (2–4 characters).</p>
          </div>
          <Button
            size="sm"
            onClick={saveAdminSettings}
            disabled={savingAdmin || !collegeCode.trim()}
            className="h-9"
          >
            {savingAdmin ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
        <div className="px-6 py-4 bg-zinc-50/60">
          <p className="text-xs text-zinc-500">
            Student batches are managed separately.{" "}
            <Link href="/admin/batches" className="inline-flex items-center gap-0.5 text-zinc-700 font-medium hover:underline">
              Go to Batches <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </section>

      {/* Site Configuration */}
      <section className="rounded-2xl border border-[#E8E5E1] bg-white divide-y divide-[#E8E5E1]">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-[#18181B]">Site Configuration</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Placement season, announcements, and registration gate</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="placementSeasonName">Placement Season Name</Label>
            <Input
              id="placementSeasonName"
              value={placementSeasonName}
              onChange={(e) => setPlacementSeasonName(e.target.value)}
              placeholder="Placement Season 2025-26"
              className="max-w-md border-[#E8E5E1]"
            />
            <p className="text-xs text-zinc-500">Displayed on the admin dashboard header.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcementText">Announcement Banner</Label>
            <Textarea
              id="announcementText"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Enter an announcement visible to all users…"
              className="max-w-md border-[#E8E5E1] resize-none"
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-zinc-500">{announcementText.length}/500 characters</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E8E5E1] px-4 py-3 max-w-md">
            <div>
              <p className="text-sm font-medium text-[#18181B]">Show Announcement</p>
              <p className="text-xs text-zinc-500 mt-0.5">Display the banner to all logged-in users</p>
            </div>
            <Switch
              id="announcementActive"
              checked={announcementActive}
              onCheckedChange={setAnnouncementActive}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E8E5E1] px-4 py-3 max-w-md">
            <div>
              <p className="text-sm font-medium text-[#18181B]">Student Registrations</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {registrationOpen ? "Open — new students can register" : "Closed — no new registrations"}
              </p>
            </div>
            <Switch
              id="registrationOpen"
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
            />
          </div>

          <Button
            size="sm"
            onClick={saveSiteSettings}
            disabled={savingSite || !placementSeasonName.trim()}
            className="h-9"
          >
            {savingSite ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
        <div className="px-6 py-4 bg-zinc-50/60">
          <p className="text-xs text-zinc-500">
            Push notifications are managed separately.{" "}
            <Link href="/admin/notifications" className="inline-flex items-center gap-0.5 text-zinc-700 font-medium hover:underline">
              Go to Notifications <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
