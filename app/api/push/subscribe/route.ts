import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

// GET - Check whether the current user has an active push subscription
export async function GET() {
    const { error, session } = await requireAuth()
    if (error || !session) return error

    const subscription = await prisma.pushSubscription.findFirst({
        where: { userId: session.user.id },
        select: { id: true, endpoint: true, createdAt: true },
    })

    return NextResponse.json({
        isSubscribed: !!subscription,
        subscription: subscription
            ? { endpoint: subscription.endpoint, subscribedAt: subscription.createdAt }
            : null,
    })
}

// POST - Save a new push subscription (idempotent upsert on endpoint)
export async function POST(request: NextRequest) {
    const { error, session } = await requireAuth()
    if (error || !session) return error

    const body = await request.json().catch(() => null)
    const subscription = body?.subscription ?? body
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 })
    }

    const userAgent = request.headers.get("user-agent") ?? undefined

    await prisma.pushSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        create: {
            userId: session.user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userAgent,
        },
        update: {
            userId: session.user.id,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            userAgent,
        },
    })

    return NextResponse.json({ success: true })
}

// DELETE - Remove a push subscription by endpoint (or all if no endpoint given)
export async function DELETE(request: NextRequest) {
    const { error, session } = await requireAuth()
    if (error || !session) return error

    const body = await request.json().catch(() => ({}))
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint : null

    await prisma.pushSubscription.deleteMany({
        where: {
            userId: session.user.id,
            ...(endpoint ? { endpoint } : {}),
        },
    })

    return NextResponse.json({ success: true })
}
