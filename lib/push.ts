import webpush from "web-push"
import { prisma } from "@/lib/prisma"

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
}

let vapidInitialized = false

function ensureVapid() {
  if (vapidInitialized) return

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL ?? "mailto:admin@campusconnect.app"

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys not configured. Run: npx web-push generate-vapid-keys " +
        "and set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY in .env"
    )
  }

  webpush.setVapidDetails(email, publicKey, privateKey)
  vapidInitialized = true
}

interface SendResult { sent: number; failed: number }

async function sendToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/dashboard",
        icon: payload.icon ?? "/favicon.ico",
        tag: payload.tag ?? "campusconnect",
      })
    )
    return true
  } catch (err: unknown) {
    // 410 Gone = subscription expired — clean it up
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      (err as { statusCode: number }).statusCode === 410
    ) {
      await prisma.pushSubscription.deleteMany({
        where: { endpoint: subscription.endpoint },
      })
    }
    return false
  }
}

/**
 * Send a push notification to all active subscriptions for a single user.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<SendResult> {
  ensureVapid()
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  })

  let sent = 0
  let failed = 0
  await Promise.all(
    subs.map(async (s) => {
      const ok = await sendToSubscription(s, payload)
      ok ? sent++ : failed++
    })
  )
  return { sent, failed }
}

/**
 * Send a push notification to all subscribers in a batch.
 */
export async function sendPushToBatch(
  batchId: string,
  payload: PushPayload
): Promise<SendResult> {
  ensureVapid()
  const subs = await prisma.pushSubscription.findMany({
    where: { user: { batchId } },
    select: { endpoint: true, p256dh: true, auth: true },
  })

  let sent = 0
  let failed = 0
  await Promise.all(
    subs.map(async (s) => {
      const ok = await sendToSubscription(s, payload)
      ok ? sent++ : failed++
    })
  )
  return { sent, failed }
}

/**
 * Broadcast a push notification to every subscribed user.
 */
export async function sendPushBroadcast(payload: PushPayload): Promise<SendResult> {
  ensureVapid()
  const subs = await prisma.pushSubscription.findMany({
    select: { endpoint: true, p256dh: true, auth: true },
  })

  let sent = 0
  let failed = 0
  // Send in batches of 50 to avoid overwhelming the push service
  for (let i = 0; i < subs.length; i += 50) {
    const batch = subs.slice(i, i + 50)
    await Promise.all(
      batch.map(async (s) => {
        const ok = await sendToSubscription(s, payload)
        ok ? sent++ : failed++
      })
    )
  }
  return { sent, failed }
}
