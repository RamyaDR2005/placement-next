# CampusConnect — Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended for serverless)
- Cloudflare R2 account (for file storage)
- SMTP server or Gmail app password (for email notifications)
- Google Cloud Console project (for OAuth)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd placement-next
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

<!-- AUTO-GENERATED: env vars — sourced from .env.example -->
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Direct URL for migrations (without connection pooler)
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"      # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3500"         # match the dev port

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (SMTP / Gmail app password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Placement Portal <noreply@example.com>"

# Cloudflare R2 Storage
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="placement-portal"
R2_PUBLIC_URL=""

# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:admin@example.com"

# Cron Job Security
CRON_SECRET="your-cron-secret"
```
<!-- AUTO-GENERATED END -->

### 3. Generate VAPID Keys (for Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copy the output into `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`.

### 4. Database Setup

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (development, no migration file)
pnpm db:push

# Or create a tracked migration
pnpm db:migrate

# Optional: seed database with initial data
pnpm db:seed

# Optional: open Prisma Studio UI
pnpm db:studio
```

### 5. Run Development Server

```bash
pnpm dev
```

Opens at [http://localhost:3500](http://localhost:3500) (Turbopack enabled).

---

## Available Scripts

<!-- AUTO-GENERATED: scripts — sourced from package.json -->
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server on port 3500 with Turbopack |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix ESLint errors |
| `pnpm type-check` | TypeScript type check (no emit) |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm db:generate` | Regenerate Prisma client from schema |
| `pnpm db:migrate` | Create and apply a migration (dev) |
| `pnpm db:migrate:prod` | Apply pending migrations (production) |
| `pnpm db:reset` | Reset database and re-run all migrations |
| `pnpm db:studio` | Open Prisma Studio UI |
| `pnpm db:push` | Push schema changes without migration file (dev) |
| `pnpm db:seed` | Run seed script (`prisma/seed.ts`) |
| `pnpm clean` | Remove `.next` and node_modules cache |
| `pnpm analyze` | Production build with bundle analysis |
<!-- AUTO-GENERATED END -->

---

## Project Structure

```
placement-next/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public auth pages (login, signup, verify-email)
│   ├── admin/             # Admin pages — layout enforces ADMIN role
│   ├── api/               # API routes (see docs/README.md for full reference)
│   ├── applications/      # Student: my applications
│   ├── dashboard/         # Student dashboard
│   ├── documents/         # Student documents
│   ├── jobs/              # Student job discovery
│   ├── notifications/     # Student notifications
│   ├── profile/           # Multi-step profile form
│   └── settings/          # Student settings
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── steps/             # Profile form steps
│   └── ui/                # shadcn/ui primitives
├── docs/                  # Documentation (this directory)
├── hooks/                 # Custom React hooks
├── lib/                   # Core utilities and configurations
├── prisma/                # Database schema and migrations
├── public/                # Static assets (including sw.js)
└── types/                 # TypeScript type definitions
```

---

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect the repository to Vercel
3. Add all environment variables in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your production domain
5. Deploy — `pnpm build` runs automatically (includes `prisma generate`)

### Run Migrations in Production

```bash
# In CI / Vercel build step (add as a pre-build command)
pnpm db:migrate:prod
```

### Cron Jobs

Add `vercel.json` to configure the deadline-reminder cron:

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

The cron endpoint requires `Authorization: Bearer <CRON_SECRET>` header (Vercel adds this automatically).

---

## Troubleshooting

### Database Connection Issues

1. Confirm `DATABASE_URL` is the pooler URL (for queries)
2. Confirm `DIRECT_URL` is the direct URL (for migrations)
3. Add `?sslmode=require` for Neon connections
4. Run `pnpm db:generate` after any schema changes

### Push Notifications Not Working

1. Verify VAPID keys match what was generated
2. HTTPS is required — localhost works only with browser exemptions
3. Check `public/sw.js` is accessible at the root of the deployed site

### Build Errors

```bash
# Clear caches and rebuild
pnpm clean
pnpm install
pnpm build
```

### Auth Errors

- Ensure `NEXTAUTH_URL` matches the actual URL (including port in dev)
- Ensure `NEXTAUTH_SECRET` is set in all environments
- Verify Google OAuth redirect URI matches `NEXTAUTH_URL/api/auth/callback/google`

---

## Support

For issues and feature requests, open an issue on GitHub.
