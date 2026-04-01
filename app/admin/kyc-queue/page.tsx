import { redirect } from "next/navigation"

// KYC queue consolidated at /admin/students/kyc
export default function KYCQueueRedirect() {
  redirect("/admin/students/kyc")
}
