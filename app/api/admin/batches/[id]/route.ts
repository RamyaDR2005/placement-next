import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { canActivateBatch } from "@/lib/batch"
import { z } from "zod"

const patchBatchSchema = z.object({
  status: z.enum(["SETUP", "ACTIVE", "ARCHIVED"]).optional(),
  name: z.string().min(1).max(50).optional(),
  collegeCode: z.string().min(1).max(10).optional(),
})

// PATCH /api/admin/batches/[id] — update a batch (activate or archive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = patchBatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const batch = await prisma.batch.findUnique({ where: { id } })
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }

  const updates: Record<string, unknown> = { ...parsed.data }

  // Enforce max active batches limit when activating
  if (parsed.data.status === "ACTIVE" && batch.status !== "ACTIVE") {
    const { allowed, activeCount, maxAllowed } = await canActivateBatch()
    if (!allowed) {
      return NextResponse.json(
        { error: `Cannot activate: already ${activeCount} of ${maxAllowed} batches are active. Archive one first.` },
        { status: 409 }
      )
    }
    updates.startedAt = new Date()
  }

  if (parsed.data.status === "ARCHIVED" && batch.status !== "ARCHIVED") {
    updates.archivedAt = new Date()
  }

  const updated = await prisma.batch.update({ where: { id }, data: updates })
  return NextResponse.json({ batch: updated })
}
