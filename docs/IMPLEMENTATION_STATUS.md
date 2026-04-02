# Implementation Status — CampusConnect

<!-- AUTO-GENERATED: last updated by /update-docs — do not edit section headers manually -->
**Last Updated:** 2026-04-02  
**Branch:** main  
**Build:** passing

---

## Completed

### Authentication & Security
- NextAuth.js v5 — Google OAuth + Credentials (email/password)
- Role-based access: STUDENT, RECRUITER, ADMIN
- JWT session strategy (30-day max age)
- Email verification required before login
- `requireAdmin` / `requireAuth` / `requireRole` helpers in `lib/auth-helpers.ts`
- Security event logging (`logSecurityEvent`)
- Change password endpoint for credentials accounts (`/api/auth/change-password`)
- OAuth accounts show provider info instead of password form
- Middleware adds security headers; unauthenticated users redirect to `/login`
- Admin layout enforces ADMIN role — no per-page auth duplication

### Database Schema (Prisma)
- User, Profile (~280 fields), Job, Application, Placement, Company
- JobUpdate — job announcements per job
- ScheduleEvent, EventAttendee — calendar and attendance
- Notification, PushSubscription, DeadlineReminder
- Attendance — QR scan records
- BackupLog — manual backup history
- Settings — site-wide configuration (USN pattern, year gating, etc.)
- ApplicationStatus enum: APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → INTERVIEWED → SELECTED → OFFER_ACCEPTED / OFFER_REJECTED / REJECTED
- Tier system: TIER_1 (>9 LPA), TIER_2 (5–9 LPA), TIER_3 (≤5 LPA), DREAM (>10 LPA)
- isDreamOffer flag — dream offers bypass tier restrictions

### API Layer
- Standard response envelope enforced across all routes:
  - Success: `{ success: true, data: <payload> }`
  - Error: `{ error: "message" }` with appropriate HTTP status
- All routes use typed Prisma inputs (no `any` casts)
- Full route list: see [docs/README.md — API Reference](./README.md#api-reference)

### Student Features
- Multi-step profile form (personal info, contact, academic, engineering, review)
- KYC verification workflow with document upload
- Job discovery with tier-based eligibility filtering
- One-click job application
- Application status tracking (full lifecycle with admin feedback and interview dates)
- My Applications page with status badges
- Notifications page — filter by type/read status
- Notification bell with real-time unread count (30s polling)
- Browser push notifications (subscribe/unsubscribe in settings)
- QR code generated on job application for attendance
- Documents page
- Password change (settings)
- Dashboard with profile completion %, KYC status, quick stats

### Admin Features
- Admin dashboard with key stats
- KYC queue — approve/reject with feedback
- Student list — view profiles, filter by branch/batch
- Job management — create/edit (TipTap rich text), tier/category, branch restrictions, eligibility
- Applicants view per job — status badges, update statuses, remove/restore, Excel export
- Application status workflow with student notifications on each transition
- Placements recording and analytics
- Bulk notifications — target by role, branch, or batch
- Bulk email notifications
- Event scheduling (calendar + registration)
- QR code scanner for attendance
- Analytics dashboard — placement stats, charts (Recharts)
- Company management (CRUD)
- Site settings (USN validation, year gating, registration open/close)
- Manual backup with history log
- Consolidated sidebar (7 tabs)

### Infrastructure
- Cloudflare R2 file storage — resume, photo, marks cards, certificates
- SMTP email (Nodemailer) — verification, notifications
- Push notifications (web-push / VAPID)
- Vercel Cron — deadline reminders run hourly
- Service worker (`public/sw.js`) — handles push events and notification clicks

---

## Pending / Not Started

### Google Calendar Integration
No progress. Blocked on OAuth 2.0 refresh token storage.

Files needed:
- `lib/google-calendar.ts`
- `app/api/auth/google-calendar/route.ts`
- `app/api/schedule/sync/route.ts`
- Add `googleRefreshToken` to Profile schema

Dependency: `pnpm add googleapis`

### Real-time Notifications (WebSocket / SSE)
Current implementation uses 30-second polling. WebSocket or Server-Sent Events upgrade is optional — polling is acceptable for current scale.

### Test Suite
No test framework is configured (`pnpm test` is a placeholder). Unit and integration tests are the highest-priority engineering debt.

---

## Known Technical Debt

| Area | Issue |
|------|-------|
| Tests | No test suite — `pnpm test` is a no-op |
| Profile model | ~280 fields is oversized; consider splitting into sub-models |
| Notification polling | 30s polling works but SSE would be more efficient |
| `components/ui/` | Some unused shadcn primitives remain from scaffolding |
<!-- AUTO-GENERATED END -->
