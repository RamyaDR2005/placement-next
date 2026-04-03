"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("Dashboard error:", error.digest ?? error.message)
  }, [error])

  return (
    <main className="flex-1 bg-white min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-neutral-500">
          We couldn&apos;t load your dashboard. This is usually temporary.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="sm">
            Try again
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile">Go to Profile</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
