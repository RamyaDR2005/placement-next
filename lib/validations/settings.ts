import { z } from "zod"

export const adminSettingsSchema = z.object({
  activeAdmissionYears: z
    .array(z.string().regex(/^\d{2}$/, "Must be 2-digit year"))
    .min(1, "At least one year required"),
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
