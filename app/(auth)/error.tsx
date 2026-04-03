"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Auth error:", error.digest ?? error.message)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-lg font-semibold">Authentication error</h2>
        <p className="text-sm text-neutral-500">
          Something went wrong during sign in. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="sm">
            Try again
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
