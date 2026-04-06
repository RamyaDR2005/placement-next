"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  readAt?: Date | null
  data?: Record<string, unknown>
}

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  JOB_POSTED:          { label: "New Job",            icon: "💼", color: "bg-blue-50 text-blue-600" },
  APPLICATION_STATUS:  { label: "Application Update", icon: "📋", color: "bg-violet-50 text-violet-600" },
  INTERVIEW_SCHEDULED: { label: "Interview",           icon: "📅", color: "bg-cyan-50 text-cyan-600" },
  KYC_UPDATE:          { label: "KYC",                 icon: "✅", color: "bg-emerald-50 text-emerald-600" },
  EVENT_REMINDER:      { label: "Reminder",            icon: "⏰", color: "bg-amber-50 text-amber-600" },
  SYSTEM:              { label: "System",              icon: "🔔", color: "bg-[#F4F0EB] text-[#52525B]" },
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [filter, setFilter] = useState<string>("all")
  const [tab, setTab] = useState<string>("all")

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filter === "all" || n.type === filter
    const matchesTab = tab === "all" || (tab === "unread" ? !n.isRead : n.isRead)
    return matchesFilter && matchesTab
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (ids: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: ids }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)))
        toast.success("Marked as read")
      }
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        toast.success("All notifications marked as read")
      }
    } catch {
      toast.error("Failed to mark all as read")
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        toast.success("Notification deleted")
      }
    } catch {
      toast.error("Failed to delete notification")
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?all=true", { method: "DELETE" })
      if (response.ok) {
        setNotifications([])
        toast.success("All notifications deleted")
      }
    } catch {
      toast.error("Failed to delete notifications")
    }
  }

  const getTypeInfo = (type: string) => TYPE_INFO[type] || TYPE_INFO.SYSTEM

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#18181B]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#71717A]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="h-9 gap-1.5 text-xs border-[#E8E5E1] hover:bg-[#F4F0EB]"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs border-[#E8E5E1] text-red-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your notifications will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllNotifications} className="bg-red-600 hover:bg-red-700">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filter + Tabs */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-9 w-44 border-[#E8E5E1] bg-white text-sm">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_INFO).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                {info.icon} {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="h-9 bg-[#F4F0EB] border-0">
            <TabsTrigger value="all" className="text-xs">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="read" className="text-xs">Read ({notifications.length - unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E5E1] bg-white py-16 text-center">
                <Bell className="mx-auto h-8 w-8 text-[#D4CFC9]" />
                <p className="mt-3 text-sm font-medium text-[#52525B]">No notifications</p>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  {tab === "unread" ? "You're all caught up!" : "Your notifications will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => {
                  const typeInfo = getTypeInfo(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative flex gap-4 rounded-2xl border border-[#E8E5E1] bg-white p-4 transition-all hover:border-[#D4CFC9] hover:shadow-sm",
                        !notification.isRead && "bg-amber-50/40 border-amber-100"
                      )}
                    >
                      {/* Unread dot */}
                      {!notification.isRead && (
                        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-amber-400" />
                      )}

                      {/* Type icon */}
                      <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-base",
                        typeInfo.color
                      )}>
                        {typeInfo.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            "text-sm text-[#18181B]",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="inline-flex items-center rounded-full bg-[#F4F0EB] px-2 py-0.5 text-[10px] text-[#52525B]">
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#71717A] leading-relaxed">{notification.message}</p>
                        <p className="mt-2 text-xs text-[#A1A1AA]">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          {" · "}
                          {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      {/* Hover actions */}
                      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead([notification.id])}
                            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#F4F0EB] transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5 text-[#71717A]" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
