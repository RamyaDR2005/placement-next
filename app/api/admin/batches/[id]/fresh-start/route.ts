import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { z } from "zod"

const freshStartSchema = z.object({
  newBatchName: z.string().min(1).max(50),
  newAdmissionYear: z.string().regex(/^\d{2}$/, "Must be 2 digits e.g. '26'"),
  collegeCode: z.string().min(1).max(10).optional(),
})

/**
 * POST /api/admin/batches/[id]/fresh-start
 *
 * Archives the specified batch and creates a new SETUP batch.
 * All existing student records are preserved — students remain
 * linked to the archived batch for historical reporting.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = freshStartSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const existingBatch = await prisma.batch.findUnique({
    where: { id },
    include: { _count: { select: { students: true } } },
  })
  if (!existingBatch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  }
  if (existingBatch.status === "ARCHIVED") {
    return NextResponse.json({ error: "Batch is already archived" }, { status: 409 })
  }

  const { newBatchName, newAdmissionYear, collegeCode } = parsed.data

  // Run archive + create atomically
  const [archivedBatch, newBatch] = await prisma.$transaction([
    prisma.batch.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    }),
    prisma.batch.create({
      data: {
        name: newBatchName,
        admissionYear: newAdmissionYear,
        collegeCode: collegeCode ?? existingBatch.collegeCode,
        status: "SETUP",
        createdBy: session.user.id,
      },
    }),
  ])

  return NextResponse.json({
    archivedBatch: { id: archivedBatch.id, name: archivedBatch.name, studentCount: existingBatch._count.students },
    newBatch: { id: newBatch.id, name: newBatch.name, status: newBatch.status },
  }, { status: 201 })
}
