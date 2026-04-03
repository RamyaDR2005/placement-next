import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"
import { sendPushBroadcast, sendPushToBatch, sendPushToUser } from "@/lib/push"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1).max(50),
  body: z.string().min(1).max(120),
  url: z.string().optional(),
  /** "all" | "batch" | "usn" */
  target: z.enum(["all", "batch", "usn"]).default("all"),
  /** Required when target = "batch" */
  batchId: z.string().optional(),
  /** Required when target = "usn" */
  usn: z.string().optional(),
})

// POST /api/admin/notifications/push
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, body: msgBody, url, target, batchId, usn } = parsed.data

  const payload = { title, body: msgBody, url }

  try {
    let result: { sent: number; failed: number }

    if (target === "batch") {
      if (!batchId) {
        return NextResponse.json({ error: "batchId required for batch target" }, { status: 400 })
      }
      result = await sendPushToBatch(batchId, payload)
    } else if (target === "usn") {
      if (!usn) {
        return NextResponse.json({ error: "usn required for usn target" }, { status: 400 })
      }
      // Resolve USN → userId
      const profile = await prisma.profile.findUnique({
        where: { usn },
        select: { userId: true },
      })
      if (!profile) {
        return NextResponse.json({ error: `No student found with USN: ${usn}` }, { status: 404 })
      }
      result = await sendPushToUser(profile.userId, payload)
    } else {
      // broadcast to all
      result = await sendPushBroadcast(payload)
    }

    return NextResponse.json({ success: true, ...result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send push notifications"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
