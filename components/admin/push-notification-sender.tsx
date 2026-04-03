"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Send, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface Batch { id: string; name: string }

interface PushNotificationSenderProps {
  activeBatches: Batch[]
}

const TITLE_MAX = 50
const BODY_MAX = 120

export function PushNotificationSender({ activeBatches }: PushNotificationSenderProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("")
  const [target, setTarget] = useState<"all" | "batch" | "usn">("all")
  const [batchId, setBatchId] = useState("")
  const [usn, setUsn] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number } | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required")
      return
    }
    if (target === "batch" && !batchId) {
      toast.error("Select a batch")
      return
    }
    if (target === "usn" && !usn.trim()) {
      toast.error("Enter a USN")
      return
    }

    setIsSending(true)
    setLastResult(null)

    try {
      const res = await fetch("/api/admin/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || undefined,
          target,
          ...(target === "batch" ? { batchId } : {}),
          ...(target === "usn" ? { usn: usn.trim() } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to send")
      }

      setLastResult({ sent: data.sent, failed: data.failed })
      toast.success(`Push sent — ${data.sent} delivered, ${data.failed} failed`)

      // Reset form
      setTitle("")
      setBody("")
      setUrl("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send push notification")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Send Push Notification</CardTitle>
            <CardDescription>
              Delivers instantly to subscribed browsers — no email required
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="push-title">
                Title{" "}
                <span className="text-xs text-muted-foreground">
                  ({title.length}/{TITLE_MAX})
                </span>
              </Label>
              <Input
                id="push-title"
                placeholder="e.g. New Job Posted"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="push-body">
                Message{" "}
                <span className="text-xs text-muted-foreground">
                  ({body.length}/{BODY_MAX})
                </span>
              </Label>
              <Textarea
                id="push-body"
                placeholder="e.g. Infosys has posted a new role — apply before the deadline."
                value={body}
                maxLength={BODY_MAX}
                rows={3}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="push-url">
                URL on click{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="push-url"
                placeholder="/jobs or /dashboard"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Target</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as typeof target)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  {activeBatches.length > 0 && (
                    <SelectItem value="batch">By Batch</SelectItem>
                  )}
                  <SelectItem value="usn">By USN (individual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === "batch" && (
              <div className="space-y-1.5">
                <Label>Batch</Label>
                <Select value={batchId} onValueChange={setBatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBatches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {target === "usn" && (
              <div className="space-y-1.5">
                <Label htmlFor="push-usn">USN</Label>
                <Input
                  id="push-usn"
                  placeholder="e.g. 2SD22CS001"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                />
              </div>
            )}

            <Button onClick={handleSend} disabled={isSending || !title || !body} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {isSending ? "Sending…" : "Send Push"}
            </Button>

            {lastResult && (
              <div className="flex gap-2 text-sm">
                <Badge variant="default">{lastResult.sent} delivered</Badge>
                {lastResult.failed > 0 && (
                  <Badge variant="destructive">{lastResult.failed} failed</Badge>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Preview</p>
            <div className="rounded-xl border bg-neutral-50 p-4 shadow-sm max-w-xs">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-neutral-800 p-1.5 shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {title || "Notification title"}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                    {body || "Your message will appear here."}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">CampusConnect • now</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Only students who have enabled push notifications will receive this.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
