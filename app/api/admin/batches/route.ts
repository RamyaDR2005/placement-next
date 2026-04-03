import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"
import { canActivateBatch } from "@/lib/batch"
import { z } from "zod"

const createBatchSchema = z.object({
  name: z.string().min(1).max(50),
  admissionYear: z.string().regex(/^\d{2}$/, "Admission year must be 2 digits e.g. '22'"),
  collegeCode: z.string().min(1).max(10).optional(),
})

// GET /api/admin/batches — list all batches with student counts
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { students: true } },
      creator: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json({ batches })
}

// POST /api/admin/batches — create a new batch (starts in SETUP status)
export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin()
  if (error || !session) return error

  const body = await request.json().catch(() => null)
  const parsed = createBatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, admissionYear, collegeCode } = parsed.data

  const batch = await prisma.batch.create({
    data: {
      name,
      admissionYear,
      collegeCode: collegeCode ?? "2SD",
      status: "SETUP",
      createdBy: session.user.id,
    },
  })

  return NextResponse.json({ batch }, { status: 201 })
}
