export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { BatchManagementView } from "@/components/admin/batch-management-view"

export default async function BatchesPage() {
  const [batches, settings] = await Promise.all([
    prisma.batch.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { students: true } },
        creator: { select: { name: true, email: true } },
      },
    }),
    prisma.adminSettings.findUnique({ where: { id: "default" } }),
  ])

  const activeCount = batches.filter((b) => b.status === "ACTIVE").length
  const maxActiveBatches = settings?.maxActiveBatches ?? 2

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Batch Management</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage admission year batches and placement seasons</p>
      </div>
      <div>
        <BatchManagementView
          batches={batches.map((b) => ({
            ...b,
            startedAt: b.startedAt?.toISOString() ?? null,
            archivedAt: b.archivedAt?.toISOString() ?? null,
            createdAt: b.createdAt.toISOString(),
          }))}
          activeCount={activeCount}
          maxActiveBatches={maxActiveBatches}
        />
      </div>
    </div>
  )
}
