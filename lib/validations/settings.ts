import { z } from "zod"

export const adminSettingsSchema = z.object({
  collegeCode: z.string().min(2).max(4),
})

export const siteSettingsSchema = z.object({
  placementSeasonName: z.string().min(1).max(100),
  activeBatch: z.string().min(1).max(20),
  announcementText: z.string().max(500).nullable().optional(),
  announcementActive: z.boolean(),
  registrationOpen: z.boolean(),
})

export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>
