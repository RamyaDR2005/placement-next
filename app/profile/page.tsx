export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileCompletion } from "@/components/profile-completion"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">My Profile</h1>
        <p className="mt-1 text-sm text-[#71717A]">
          Complete your profile to unlock all placement opportunities
        </p>
      </div>
      <ProfileCompletion />
    </div>
  )
}
