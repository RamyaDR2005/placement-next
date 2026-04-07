"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Calendar,
  Bell,
  BarChart2,
  Shield,
  Briefcase,
  LogOut,
  Download,
  Settings,
  ScanLine,
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  TrendingUp,
  ClipboardList,
  Building2,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Students",
    items: [
      { title: "All Students", url: "/admin/students", icon: Users },
      { title: "Verify Students", url: "/admin/students/kyc", icon: UserCheck },
      { title: "Record Placements", url: "/admin/placements", icon: TrendingUp },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { title: "Job Postings", url: "/admin/jobs", icon: Briefcase },
      { title: "Attendance Scan", url: "/admin/attendance", icon: ScanLine, exact: true },
      { title: "Attendance Records", url: "/admin/attendance/list", icon: ClipboardList },
      { title: "Schedule", url: "/admin/schedule", icon: Calendar },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Analytics", url: "/admin/analytics", icon: BarChart2 },
      { title: "Company Analysis", url: "/admin/analytics/companies", icon: Building2 },
      { title: "Export & Backup", url: "/admin/backup", icon: Download },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Batches", url: "/admin/batches", icon: GraduationCap },
      { title: "Site Settings", url: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-0">
      {/* Header */}
      <SidebarHeader className="bg-zinc-950 px-3 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
              <Shield className="h-4 w-4 text-zinc-950" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-tight truncate">CampusConnect</p>
                <p className="text-xs text-zinc-500 leading-tight truncate">Admin Panel</p>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <SidebarTrigger className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-7 w-7 rounded-md shrink-0" />
          )}
        </div>
        {isCollapsed && (
          <div className="mt-2 flex justify-center">
            <SidebarTrigger className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-7 w-7 rounded-md" />
          </div>
        )}
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="bg-zinc-950 px-2 py-2 gap-0">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1 px-0">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-zinc-600 text-[10px] uppercase tracking-widest font-semibold px-2 pb-1 pt-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            {isCollapsed && <div className="h-2" />}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isActive = (item as { url: string; exact?: boolean }).exact
                    ? pathname === item.url
                    : pathname === item.url || pathname?.startsWith(item.url + "/")
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className={cn(
                          "h-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                          isActive && "bg-zinc-800 text-white font-medium"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5">
                          <item.icon className={cn("shrink-0", isCollapsed ? "h-4 w-4" : "h-4 w-4")} />
                          {!isCollapsed && <span className="text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-zinc-950 border-t border-zinc-800 px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-8 rounded-md text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="text-sm">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
