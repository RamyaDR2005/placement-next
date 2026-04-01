import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminSettingsView } from "@/components/admin/admin-settings-view"

const SETTINGS_ID = "default"

export default async function AdminSettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch fresh data directly (admin always sees latest)
  const [adminSettings, siteSettings] = await Promise.all([
    prisma.adminSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    }),
    prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    }),
  ])

  return (
    <AdminSettingsView
      adminSettings={{
        activeAdmissionYears: adminSettings.activeAdmissionYears,
        collegeCode: adminSettings.collegeCode,
      }}
      siteSettings={{
        placementSeasonName: siteSettings.placementSeasonName,
        activeBatch: siteSettings.activeBatch,
        announcementText: siteSettings.announcementText,
        announcementActive: siteSettings.announcementActive,
        registrationOpen: siteSettings.registrationOpen,
      }}
    />
  )
}
