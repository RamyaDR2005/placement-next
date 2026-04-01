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

export async function getAdminSettings(): Promise<AdminSettings> {
  const now = Date.now()
  if (adminSettingsCache && adminSettingsCache.expiresAt > now) {
    return adminSettingsCache.data
  }

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
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now()
  if (siteSettingsCache && siteSettingsCache.expiresAt > now) {
    return siteSettingsCache.data
  }

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
}

export function invalidateSettingsCache(type: "admin" | "site") {
  if (type === "admin") {
    adminSettingsCache = null
  } else {
    siteSettingsCache = null
  }
}
