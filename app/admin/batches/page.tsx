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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
        <h1 className="text-3xl font-bold">Batch Management</h1>
      </div>
      <div className="container mx-auto max-w-4xl px-4 py-8">
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
