import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/auth/check-user
// Public endpoint used during registration to check if an email is already registered.
// Intentionally returns only a boolean — does not leak any user details.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false, error: "Missing email" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    })
    return NextResponse.json({ exists: !!user })
  } catch {
    return NextResponse.json({ exists: false, error: "Server error" }, { status: 500 })
  }
}
