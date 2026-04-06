export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { Scheduler } from "@/components/scheduler"

export default async function AdminSchedulePage() {
  const session = await auth()

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Schedule Management</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage placement events, interviews, and schedules
        </p>
      </div>
      <Scheduler isAdmin={true} userId={session!.user.id} />
    </div>
  )
}
