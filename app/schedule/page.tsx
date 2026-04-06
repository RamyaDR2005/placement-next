import { auth } from "@/lib/auth"
import { Scheduler } from "@/components/scheduler"

export default async function SchedulePage() {
  const session = await auth()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Schedule</h1>
        <p className="mt-1 text-sm text-[#71717A]">
          Upcoming placement events and interview rounds
        </p>
      </div>

      <Scheduler
        isAdmin={false}
        userId={session!.user.id}
      />
    </div>
  )
}
