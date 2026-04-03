"use client"

import { useCallback, useTransition, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface Filters { q: string; status: string; tier: string }

interface JobsFilterBarProps {
  filters: Filters
  totalFiltered: number
}

function useDebounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timer) clearTimeout(timer)
      setTimer(setTimeout(() => fn(...args), delay))
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, delay]
  )
}

export function JobsFilterBar({ filters, totalFiltered }: JobsFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const push = useCallback(
    (updates: Partial<Filters>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v && v !== "" && v !== "all") params.set(k, v)
        else params.delete(k)
      })
      params.delete("page")
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [pathname, router, searchParams]
  )

  const debouncedSearch = useDebounce((value: string) => push({ q: value }), 300)
  const hasFilters = filters.q || filters.status || filters.tier

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search title or company..."
          defaultValue={filters.q}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="pl-8 w-64"
        />
      </div>

      <Select value={filters.status || "all"} onValueChange={(v) => push({ status: v })}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.tier || "all"} onValueChange={(v) => push({ tier: v })}>
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="DREAM">Dream</SelectItem>
          <SelectItem value="TIER_1">Tier 1</SelectItem>
          <SelectItem value="TIER_2">Tier 2</SelectItem>
          <SelectItem value="TIER_3">Tier 3</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => startTransition(() => router.push(pathname))}>
          <X className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      )}

      <span className="ml-auto text-sm text-muted-foreground">{totalFiltered} jobs</span>
    </div>
  )
}
