import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logSecurityEvent } from "@/lib/auth-helpers"
import { getAdminSettings, getSiteSettings, invalidateSettingsCache } from "@/lib/settings"
import { adminSettingsSchema, siteSettingsSchema } from "@/lib/validations/settings"

const SETTINGS_ID = "default"

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin()

    if (error || !session) {
      logSecurityEvent("unauthorized_admin_access", {
        endpoint: "/api/admin/settings",
        method: "GET",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })
      return error
    }

    const [adminSettings, siteSettings] = await Promise.all([
      getAdminSettings(),
      getSiteSettings(),
    ])

    return NextResponse.json({
      success: true,
      data: { adminSettings, siteSettings },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin()

    if (error || !session) {
      logSecurityEvent("unauthorized_admin_access", {
        endpoint: "/api/admin/settings",
        method: "PUT",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })
      return error
    }

    const body = await request.json()
    const { type, data } = body

    if (type !== "admin" && type !== "site") {
      return NextResponse.json(
        { error: "Invalid settings type. Must be 'admin' or 'site'." },
        { status: 400 }
      )
    }

    if (type === "admin") {
      const parsed = adminSettingsSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      await prisma.adminSettings.upsert({
        where: { id: SETTINGS_ID },
        create: {
          id: SETTINGS_ID,
          collegeCode: parsed.data.collegeCode,
          updatedBy: session.user.id,
        },
        update: {
          collegeCode: parsed.data.collegeCode,
          updatedBy: session.user.id,
        },
      })

      invalidateSettingsCache("admin")

      logSecurityEvent("admin_settings_updated", {
        adminId: session.user.id,
        changes: parsed.data,
        timestamp: new Date().toISOString(),
      })
    } else {
      const parsed = siteSettingsSchema.safeParse(data)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      await prisma.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        create: {
          id: SETTINGS_ID,
          placementSeasonName: parsed.data.placementSeasonName,
          activeBatch: parsed.data.activeBatch,
          announcementText: parsed.data.announcementText ?? null,
          announcementActive: parsed.data.announcementActive,
          registrationOpen: parsed.data.registrationOpen,
          updatedBy: session.user.id,
        },
        update: {
          placementSeasonName: parsed.data.placementSeasonName,
          activeBatch: parsed.data.activeBatch,
          announcementText: parsed.data.announcementText ?? null,
          announcementActive: parsed.data.announcementActive,
          registrationOpen: parsed.data.registrationOpen,
          updatedBy: session.user.id,
        },
      })

      invalidateSettingsCache("site")

      logSecurityEvent("site_settings_updated", {
        adminId: session.user.id,
        changes: parsed.data,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    logSecurityEvent("settings_update_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
