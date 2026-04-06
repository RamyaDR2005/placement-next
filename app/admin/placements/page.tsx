export const dynamic = "force-dynamic"

import { PlacementManagementView } from "@/components/admin/placement-management-view"

export default function PlacementsPage() {
  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">Placement Management</h1>
        <p className="mt-1 text-sm text-zinc-500">Record and track student placements</p>
      </div>
      <PlacementManagementView />
    </div>
  )
}
