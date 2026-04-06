"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Logo from "@/components/navbar-components/logo"
import NotificationMenu from "@/components/navbar-components/notification-menu"
import UserMenu from "@/components/navbar-components/user-menu"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Briefcase, ClipboardList, ScanLine, Calendar } from "lucide-react"

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/jobs",         label: "Jobs",         icon: Briefcase },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/attendance",   label: "Attendance",   icon: ScanLine },
  { href: "/schedule",     label: "Schedule",     icon: Calendar },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E5E1] bg-[#FAFAF9]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-6 px-4 sm:px-6">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo />
          <span className="font-display font-semibold text-sm tracking-tight text-[#18181B] hidden sm:block">
            CampusConnect
          </span>
        </Link>

        {/* Divider */}
        <div className="hidden md:block h-5 w-px bg-[#E8E5E1] shrink-0" />

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  isActive
                    ? "text-[#18181B] bg-[#F0EDE8]"
                    : "text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F0EB]"
                )}
              >
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-amber-400" />
                )}
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
      <nav className="md:hidden border-t border-[#E8E5E1] bg-[#FAFAF9]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-[#18181B]" : "text-[#A1A1AA]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-[#18181B]" : "text-[#A1A1AA]"
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
