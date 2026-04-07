export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KYCVerificationQueue } from "@/components/kyc-verification-queue"

export default async function KYCVerificationPage() {
  const session = await auth()

  // Fetch pending KYC verifications
  const pendingVerifications = await prisma.profile.findMany({
    where: {
      OR: [
        { kycStatus: 'PENDING' },
        { kycStatus: 'UNDER_REVIEW' }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">KYC Verification Queue</h1>
        <p className="mt-1 text-sm text-zinc-500">Review and verify student profiles and documents</p>
      </div>
      <KYCVerificationQueue
        pendingVerifications={pendingVerifications}
        adminId={session!.user.id}
      />
    </div>
  )
}
