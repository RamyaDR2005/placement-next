export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BulkNotifications } from "@/components/bulk-notifications"
import { PushNotificationSender } from "@/components/admin/push-notification-sender"
import { getActiveBatches } from "@/lib/batch"

export default async function NotificationsPage() {
  const session = await auth()

  const [totalStudents, verifiedStudents, branches, activeBatches, pushSubscriberCount] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.profile.count({ where: { kycStatus: "VERIFIED" } }),
      prisma.profile.groupBy({
        by: ["branch"],
        where: { branch: { not: null } },
        _count: { branch: true },
      }),
      getActiveBatches(),
      prisma.pushSubscription.count(),
    ])

  const stats = {
    totalStudents,
    verifiedStudents,
    branches: branches.filter((b: { branch: string | null }) => b.branch !== null),
  }

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Notifications</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Send in-app notifications and push alerts to students ·{" "}
          {pushSubscriberCount} student{pushSubscriberCount !== 1 ? "s" : ""} have push enabled
        </p>
      </div>

      <PushNotificationSender activeBatches={activeBatches} />
      <BulkNotifications stats={stats} adminId={session!.user.id} />
    </div>
  )
}
