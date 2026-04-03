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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <h1 className="text-3xl font-bold">Notifications</h1>
      </div>
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div>
          <p className="text-muted-foreground">
            Send in-app notifications and browser push alerts to students
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {pushSubscriberCount} student{pushSubscriberCount !== 1 ? "s" : ""} have push notifications enabled
          </p>
        </div>

        {/* Browser Push — shown first as it's the new channel */}
        <PushNotificationSender activeBatches={activeBatches} />

        {/* In-app / Email Bulk Notifications */}
        <BulkNotifications stats={stats} adminId={session!.user.id} />
      </div>
    </div>
  )
}
