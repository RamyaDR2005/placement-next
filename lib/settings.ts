import { prisma } from "@/lib/prisma"
import type { AdminSettings, SiteSettings } from "@prisma/client"

const SETTINGS_ID = "default"
const CACHE_TTL_MS = 60_000 // 60 seconds

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

let adminSettingsCache: CacheEntry<AdminSettings> | null = null
let siteSettingsCache: CacheEntry<SiteSettings> | null = null

const ADMIN_SETTINGS_FALLBACK: AdminSettings = {
  id: SETTINGS_ID,
  collegeCode: "2SD",
  maxActiveBatches: 2,
  updatedAt: new Date(0),
  updatedBy: null,
}

const SITE_SETTINGS_FALLBACK: SiteSettings = {
  id: SETTINGS_ID,
  placementSeasonName: "Placement Season 2025-26",
  activeBatch: "2022 - 2026",
  announcementText: null,
  announcementActive: false,
  registrationOpen: true,
  dashboardWidgets: {},
  updatedAt: new Date(0),
  updatedBy: null,
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const now = Date.now()
  if (adminSettingsCache && adminSettingsCache.expiresAt > now) {
    return adminSettingsCache.data
  }

  try {
    let settings = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
    })

    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: { id: SETTINGS_ID },
      })
    }

    adminSettingsCache = { data: settings, expiresAt: now + CACHE_TTL_MS }
    return settings
  } catch {
    // DB unavailable — return safe defaults so users aren't locked out
    return ADMIN_SETTINGS_FALLBACK
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now()
  if (siteSettingsCache && siteSettingsCache.expiresAt > now) {
    return siteSettingsCache.data
  }

  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: SETTINGS_ID },
      })
    }

    siteSettingsCache = { data: settings, expiresAt: now + CACHE_TTL_MS }
    return settings
  } catch {
    // DB unavailable — return safe defaults
    return SITE_SETTINGS_FALLBACK
  }
}

export function invalidateSettingsCache(type: "admin" | "site") {
  if (type === "admin") {
    adminSettingsCache = null
  } else {
    siteSettingsCache = null
  }
}
