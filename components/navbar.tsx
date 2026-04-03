"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Logo from "@/components/navbar-components/logo"
import NotificationMenu from "@/components/navbar-components/notification-menu"
import UserMenu from "@/components/navbar-components/user-menu"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/attendance", label: "Attendance" },
  { href: "/schedule", label: "Schedule" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 shrink-0 text-neutral-900 hover:text-neutral-700 transition-colors"
        >
          <Logo />
          <span className="font-semibold text-sm tracking-tight hidden sm:block">
            CampusConnect
          </span>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-neutral-200 shrink-0" />

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "text-neutral-900 font-medium bg-neutral-100"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-1">
          <NotificationMenu />
          <UserMenu
            avatar={session?.user?.image || undefined}
            name={session?.user?.name || undefined}
            email={session?.user?.email || undefined}
          />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden border-t border-neutral-100 bg-white">
        <div className="flex items-center justify-around py-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 text-xs rounded-md transition-colors",
                  isActive
                    ? "text-neutral-900 font-medium"
                    : "text-neutral-400 hover:text-neutral-700"
                )}
              >
                <span
                  className={cn(
                    "h-0.5 w-4 rounded-full mb-0.5 transition-colors",
                    isActive ? "bg-neutral-900" : "bg-transparent"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
