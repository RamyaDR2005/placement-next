import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BackupView } from "@/components/admin/backup-view"

export default async function BackupPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const isAdmin = user?.role === "ADMIN"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const backupLogs = await prisma.backupLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      admin: {
        select: { name: true, email: true },
      },
    },
  })

  return <BackupView initialLogs={backupLogs} />
}
