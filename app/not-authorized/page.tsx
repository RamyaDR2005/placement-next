import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NotAuthorizedPage() {
  const activeBatches = await prisma.batch.findMany({
    where: { status: "ACTIVE" },
    select: { name: true },
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Access Not Available for Your Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            The placement portal is currently open only for specific batches.
            Your batch does not have access at this time.
          </p>

          {activeBatches.length > 0 && (
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Currently active batches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {activeBatches.map((b) => (
                  <Badge key={b.name} variant="secondary" className="text-sm">
                    {b.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            If you believe this is an error, please contact the placement cell.
          </p>

          <div className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
