import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // 3 resend attempts per IP per 10 minutes
  const ip = getClientIp(request)
  const rl = rateLimit(`resend-verify:${ip}`, 3, 10 * 60 * 1000)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting another verification email." },
      { status: 429 }
    )
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      )
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, user.name || "User")
      
      return NextResponse.json(
        { message: "Verification email sent successfully" },
        { status: 200 }
      )
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
