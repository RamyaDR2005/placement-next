export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to the main admin dashboard
  redirect("/admin/dashboard")
}
