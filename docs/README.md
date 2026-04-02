# CampusConnect - Placement Management System

A full-stack placement management portal for SDMCET, built with Next.js 16 App Router, Prisma ORM, PostgreSQL (Neon), and shadcn/ui. Three roles: STUDENT, RECRUITER, ADMIN.

<!-- AUTO-GENERATED: badges — do not edit this block manually -->
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
<!-- AUTO-GENERATED END -->

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Flow](#user-flow)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Overview

CampusConnect is the official placement portal for SDMCET, enabling students to:
- Complete comprehensive profiles with academic details
- Get KYC verified for accessing placement opportunities
- Discover and apply to job openings from visiting companies
- Track application status through the full lifecycle (Applied → Selected → Offer Accepted)
- Receive in-app and push notifications about placement activities

Administrators can:
- Manage student profiles and KYC verification
- Post and manage job opportunities with tier/category classification
- Track and update application statuses per applicant
- View analytics and placement statistics
- Send bulk notifications to targeted student groups
- Record official placements and manage backup/settings

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Landing    │  │   Auth      │  │    Dashboard/Features   │  │
│  │   Page      │  │  (Login/    │  │  (Jobs, Applications,   │  │
│  │             │  │   Signup)   │  │   Profile, Admin)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Server Components (RSC)                     │    │
│  │  • auth() session validation                            │    │
│  │  • Prisma database queries                              │    │
│  │  • Server-side rendering                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              API Routes (/api/*)                         │    │
│  │  • RESTful endpoints                                    │    │
│  │  • requireAdmin / requireAuth helpers                   │    │
│  │  • Zod request validation                               │    │
│  │  • Standard envelope: { success, data } / { error }    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   NextAuth   │  │   Prisma     │  │   External Services  │   │
│  │    v5 JWT    │  │   ORM v7     │  │  (Email, R2, Push)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │ Cloudflare   │  │     SMTP / SES       │   │
│  │   (Neon)     │  │     R2       │  │   (Email Service)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Database Key Models

```
User ──────── Profile          Job ──────── Application
               │                             │
               └── KYC status                └── status (ApplicationStatus)
                                             │   adminFeedback
                                             │   interviewDate
Placement                    Notification    ScheduleEvent
Company                      Attendance      PushSubscription
```

---

## User Flow

### Student Journey

```
Sign Up → Verify Email → Complete Profile → KYC Review
                                                 │
     ┌───────────────────────────────────────────┘
     ▼
KYC Verified → Browse Jobs → Apply → Track Application Status
```

### Detailed User States

| State | Access Level | Actions Available |
|-------|-------------|-------------------|
| Unauthenticated | Public | View landing, Login, Signup |
| Email Unverified | Limited | Resend verification email |
| Profile Incomplete | Limited | Complete profile form |
| KYC Pending | Limited | View dashboard, await verification |
| KYC Verified | Full | Browse jobs, apply, track applications |
| Admin | Admin | All admin features |

### Admin Journey

```
Admin Login → Review KYC → Approve / Reject
     │
     ├── Post Jobs → Review Applicants → Update Application Statuses
     │
     └── View Analytics → Record Placements → Send Notifications
```

---

## Features

### For Students
- **Profile Management** — Multi-step form: personal info, contact, academic, engineering details, document upload
- **KYC Verification** — Secure identity verification with document upload
- **Job Discovery** — Browse jobs with eligibility filters; tier-based access control
- **Application Tracking** — Full lifecycle: Applied → Shortlisted → Interview Scheduled → Interviewed → Selected → Offer Accepted/Rejected
- **Notifications** — In-app notifications + browser push notifications for status changes
- **QR Code Attendance** — QR-based check-in for placement events
- **Password Management** — Change password; OAuth accounts show provider info

### For Administrators
- **Student Management** — View profiles, filter by branch/batch, verify KYC
- **KYC Queue** — Review and approve/reject student verifications with feedback
- **Job Posting** — Create/edit jobs with rich text editor, tier/category, branch restrictions, eligibility criteria
- **Applicant Management** — View applicants per job, update application statuses, export to Excel
- **Application Status Workflow** — APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → INTERVIEWED → SELECTED → OFFER_ACCEPTED/OFFER_REJECTED/REJECTED
- **Placements Recording** — Record official placements, view placement analytics
- **Bulk Notifications** — Target all students, verified only, by branch, or by batch
- **Event Scheduling** — Manage placement drives and interviews
- **Settings** — Site-wide configuration, year gating, USN validation rules
- **Backup** — Manual backup with history log

---

## Tech Stack

<!-- AUTO-GENERATED: tech stack — sourced from package.json -->
| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.0.10 |
| **Language** | TypeScript | ^5.9 |
| **Database** | PostgreSQL (Neon) | — |
| **ORM** | Prisma | ^7.1 |
| **Authentication** | NextAuth.js | v5 beta |
| **Styling** | Tailwind CSS + shadcn/ui | ^4.1 |
| **File Storage** | Cloudflare R2 (S3-compatible) | — |
| **Email** | Nodemailer / SMTP | ^7.0 |
| **Push Notifications** | web-push (VAPID) | ^3.6 |
| **Forms** | React Hook Form + Zod | — |
| **Charts** | Recharts | ^3.6 |
| **Package Manager** | pnpm | — |
<!-- AUTO-GENERATED END -->

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- SMTP server or Gmail app password
- Google Cloud Console project (for OAuth)
- Cloudflare R2 account (for file storage)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd placement-next

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
pnpm db:generate
pnpm db:push        # or pnpm db:migrate for tracked migrations

# Start development server (runs on port 3500)
pnpm dev
```

### Environment Variables

<!-- AUTO-GENERATED: env vars — sourced from .env.example -->
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooler URL) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL for migrations (no pooler) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Public app URL | `http://localhost:3500` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret | — |
| `SMTP_HOST` | Yes | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | SMTP port | `587` |
| `SMTP_USER` | Yes | SMTP login email | `you@gmail.com` |
| `SMTP_PASSWORD` | Yes | SMTP password or app password | — |
| `EMAIL_FROM` | Yes | Sender display name and address | `Placement Portal <noreply@example.com>` |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID | — |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key | — |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret key | — |
| `R2_BUCKET_NAME` | Yes | R2 bucket name | `placement-portal` |
| `R2_PUBLIC_URL` | Yes | Public URL for R2 bucket | `https://files.example.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Yes | VAPID public key for push notifications | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key | — |
| `VAPID_EMAIL` | Yes | Contact email for VAPID | `mailto:admin@example.com` |
| `CRON_SECRET` | Yes | Bearer token for cron job auth | random string |
<!-- AUTO-GENERATED END -->

---

## Project Structure

```
placement-next/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Public auth pages (login, signup, verify-email)
│   ├── admin/               # Admin pages (layout enforces ADMIN role)
│   │   ├── analytics/       # Placement analytics
│   │   ├── attendance/      # QR scanner
│   │   ├── backup/          # Manual backup + history
│   │   ├── companies/       # Company management
│   │   ├── jobs/            # Job management + applicants
│   │   ├── kyc-queue/       # KYC verification queue
│   │   ├── notifications/   # Bulk notification sender
│   │   ├── placements/      # Record placements
│   │   ├── schedule/        # Event scheduling
│   │   ├── settings/        # Site settings
│   │   └── students/        # Student list + KYC details
│   ├── api/                 # API routes (see API Reference)
│   ├── applications/        # Student: my applications
│   ├── dashboard/           # Student dashboard
│   ├── documents/           # Student documents
│   ├── jobs/                # Student job discovery
│   ├── not-authorized/      # 403 page
│   ├── notifications/       # Student notifications
│   ├── profile/             # Multi-step profile form
│   └── settings/            # Student settings (password, push)
├── components/
│   ├── admin/               # Admin-specific components
│   ├── navbar-components/   # Navigation + notification menu
│   ├── steps/               # Profile form steps (5 steps)
│   └── ui/                  # shadcn/ui primitives
├── hooks/                   # Custom hooks (use-file-upload, use-profile-form)
├── lib/                     # Core utilities
│   ├── auth.ts              # NextAuth config
│   ├── auth-helpers.ts      # requireAdmin, requireAuth, logSecurityEvent
│   ├── prisma.ts            # Prisma client singleton
│   ├── r2-storage.ts        # Cloudflare R2 helpers
│   ├── placement-rules.ts   # Tier eligibility logic
│   ├── settings.ts          # Site settings helpers
│   ├── usn.ts               # USN validation
│   ├── year-gate.ts         # Batch year gating
│   └── validations/         # Zod schemas
├── prisma/
│   └── schema.prisma        # Database schema (source of truth)
├── public/
│   └── sw.js               # Push notification service worker
└── types/                   # TypeScript augmentations
```

---

## API Reference

All endpoints return a standard envelope:

```typescript
// Success
{ success: true, data: <payload> }

// Error
{ error: "message" }  // with appropriate HTTP status code
```

Auth routes (`/api/auth/*`) are managed by NextAuth and use its own shape.

<!-- AUTO-GENERATED: api routes — sourced from app/api/**/route.ts -->
### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | NextAuth.js handler (Google OAuth + Credentials) |
| `/api/auth/register` | POST | Register new account with email/password |
| `/api/auth/verify-email` | GET | Verify email via token (`?token=`) |
| `/api/auth/resend-verification` | POST | Resend verification email |
| `/api/auth/check-user` | POST | Check if email exists before registration |
| `/api/auth/change-password` | POST | Change password (credentials accounts only) |

### Jobs (Student)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/jobs` | GET | Student | List eligible jobs with filters (`page`, `limit`, `category`, `tier`, `search`) |
| `/api/jobs/[id]` | GET | Student | Job detail + `hasApplied` flag |
| `/api/jobs/[id]` | POST | Student | One-click apply to job |

### Applications (Student)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/applications` | GET | Student | List own applications with pagination |

### Notifications (Student)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/notifications` | GET | User | List notifications + unread count |
| `/api/notifications` | PATCH | User | Mark notification(s) as read |
| `/api/notifications` | DELETE | User | Delete notification(s) |

### Schedule

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/schedule` | GET | User | List upcoming events |
| `/api/schedule` | POST | Admin | Create schedule event |
| `/api/schedule/[id]` | GET | User | Get event detail |
| `/api/schedule/[id]` | PUT | Admin | Update event |
| `/api/schedule/[id]` | DELETE | Admin | Delete event |
| `/api/schedule/[id]/register` | POST | Student | Register for event |
| `/api/schedule/[id]/register` | DELETE | Student | Unregister from event |

### Profile & Files

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/profile` | GET | User | Get own profile |
| `/api/profile` | PUT | User | Update own profile |
| `/api/upload` | POST | User | Upload file to Cloudflare R2 |
| `/api/delete-file` | DELETE | User | Delete file from R2 |

### Push Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/push/subscribe` | POST | User | Subscribe to push notifications |
| `/api/push/subscribe` | DELETE | User | Unsubscribe |
| `/api/push/subscribe` | GET | User | Get current subscription status |
| `/api/push/send` | POST | Admin | Send push notification to subscribers |

### Admin — Jobs

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/jobs` | GET | Admin | List jobs with pagination and filters |
| `/api/admin/jobs` | POST | Admin | Create job |
| `/api/admin/jobs` | PUT | Admin | Bulk update / extend deadline |
| `/api/admin/jobs` | DELETE | Admin | Delete job |
| `/api/admin/jobs/[id]` | GET | Admin | Get job detail |
| `/api/admin/jobs/[id]/updates` | GET | Admin | List job announcements |
| `/api/admin/jobs/[id]/updates` | POST | Admin | Post job announcement |
| `/api/admin/jobs/[id]/applicants` | GET | Admin | List applicants (supports `includeRemoved`, `search`) |
| `/api/admin/jobs/[id]/applicants` | DELETE | Admin | Soft-remove applicant |
| `/api/admin/jobs/[id]/applicants` | PATCH | Admin | Restore removed applicant |
| `/api/admin/jobs/[id]/applicants/export` | GET | Admin | Export applicants to Excel |

### Admin — Applications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/applications/[id]/status` | PUT | Admin | Update application status + send student notification |

### Admin — Companies

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/companies` | GET | Admin | List companies |
| `/api/admin/companies` | POST | Admin | Create company |
| `/api/admin/companies/[id]` | GET | Admin | Get company |
| `/api/admin/companies/[id]` | PATCH | Admin | Update company |
| `/api/admin/companies/[id]` | DELETE | Admin | Delete company |

### Admin — KYC & Students

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/kyc-verification` | POST | Admin | Approve or reject KYC |

### Admin — Placements

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/placements` | GET | Admin | List placements with filters and stats |
| `/api/admin/placements` | POST | Admin | Record a placement |
| `/api/admin/placements` | DELETE | Admin | Delete a placement record |

### Admin — Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/notifications` | POST | Admin | Send bulk notification (target by role/branch/batch) |
| `/api/admin/notifications` | GET | Admin | Notification stats and recent history |
| `/api/admin/bulk-notifications` | POST | Admin | Bulk email notifications |

### Admin — Settings & Backup

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/settings` | GET | Admin | Get site settings |
| `/api/admin/settings` | PUT | Admin | Update site settings |
| `/api/admin/backup` | POST | Admin | Trigger manual backup |
| `/api/admin/backup/history` | GET | Admin | List backup history |

### Attendance

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/attendance/scan` | POST | Admin | Process QR code scan for attendance |

### Cron (Internal)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/cron/deadline-reminders` | GET/POST | `CRON_SECRET` | Send deadline reminder notifications (runs hourly on Vercel) |
<!-- AUTO-GENERATED END -->

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup for Production

1. Set all environment variables in Vercel dashboard
2. Set `NEXTAUTH_URL` to your production domain
3. Configure SMTP or SES for transactional email
4. Set up Cloudflare R2 CORS to allow your production domain
5. Generate VAPID keys: `npx web-push generate-vapid-keys`
6. Set `CRON_SECRET` and configure `vercel.json` cron schedule

### Cron Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/deadline-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Database Migrations

```bash
# Development: push without migration file
pnpm db:push

# Production: apply tracked migrations
pnpm db:migrate:prod
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing code style (TypeScript strict, Prisma typed inputs, standard API envelope)
4. Commit changes with conventional commits format (`feat:`, `fix:`, `refactor:`, etc.)
5. Push to branch and open a Pull Request

---

Built for SDMCET
