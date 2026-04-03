import { prisma } from "@/lib/prisma"
import type { Batch } from "@prisma/client"

/**
 * Returns all batches with ACTIVE status (max 2 at a time by policy).
 */
export async function getActiveBatches(): Promise<Batch[]> {
  return prisma.batch.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startedAt: "asc" },
  })
}

/**
 * Returns the batch a specific user belongs to, or null if unassigned.
 */
export async function getBatchForUser(userId: string): Promise<Batch | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { batch: true },
  })
  return user?.batch ?? null
}

/**
 * Checks whether a new batch can be activated given the current active count
 * and the configured maxActiveBatches limit from AdminSettings.
 */
export async function canActivateBatch(): Promise<{ allowed: boolean; activeCount: number; maxAllowed: number }> {
  const [activeCount, settings] = await Promise.all([
    prisma.batch.count({ where: { status: "ACTIVE" } }),
    prisma.adminSettings.findUnique({ where: { id: "default" } }),
  ])
  const maxAllowed = settings?.maxActiveBatches ?? 2
  return { allowed: activeCount < maxAllowed, activeCount, maxAllowed }
}
