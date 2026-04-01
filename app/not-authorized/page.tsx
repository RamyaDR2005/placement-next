import { getAdminSettings } from "@/lib/settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function NotAuthorizedPage() {
  const settings = await getAdminSettings()

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Access Not Available for Your Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            The placement portal is currently open only for specific admission years.
            Your batch year does not have access at this time.
          </p>

          <div className="text-center">
            <p className="text-sm font-medium mb-2">Currently active batch years:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {settings.activeAdmissionYears.map((year) => (
                <Badge key={year} variant="secondary" className="text-sm">
                  20{year} Admission
                </Badge>
              ))}
            </div>
          </div>

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
