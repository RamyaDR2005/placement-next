import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
  const { error, session } = await requireAdmin()
  if (error || !session) {
    return (
      error || NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  try {
    const backupLogs = await prisma.backupLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({ data: backupLogs })
  } catch (err) {
    console.error("Error fetching backup history:", err)
    return NextResponse.json(
      { error: "Failed to fetch backup history" },
      { status: 500 }
    )
  }
}
