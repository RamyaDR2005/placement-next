/*
  Warnings:

  - You are about to drop the column `cover_letter` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `interview_date` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `interview_feedback` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `joining_date` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `offer_letter` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `offered_salary` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `company_name` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('TRAINING_INTERNSHIP', 'INTERNSHIP', 'FTE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_POSTED', 'JOB_UPDATED', 'JOB_DEADLINE_REMINDER', 'JOB_DEADLINE_EXTENDED', 'APPLICATION_STATUS', 'INTERVIEW_SCHEDULED', 'KYC_UPDATE', 'EVENT_REMINDER', 'PLACEMENT_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PlacementTier" AS ENUM ('TIER_3', 'TIER_2', 'TIER_1', 'DREAM');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "cover_letter",
DROP COLUMN "interview_date",
DROP COLUMN "interview_feedback",
DROP COLUMN "joining_date",
DROP COLUMN "notes",
DROP COLUMN "offer_letter",
DROP COLUMN "offered_salary",
DROP COLUMN "status",
ADD COLUMN     "is_removed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "removal_reason" TEXT,
ADD COLUMN     "removed_at" TIMESTAMP(3),
ADD COLUMN     "removed_by" TEXT;

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "company",
ADD COLUMN     "category" "JobCategory" NOT NULL DEFAULT 'FTE',
ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "company_name" TEXT NOT NULL,
ADD COLUMN     "is_dream_offer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tier" "PlacementTier" NOT NULL DEFAULT 'TIER_3';

-- DropEnum
DROP TYPE "ApplicationStatus";

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "job_id" TEXT,
    "event_id" TEXT,
    "qr_code" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3),
    "scanned_by" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "tier" "PlacementTier" NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "company_name" TEXT NOT NULL,
    "is_exception" BOOLEAN NOT NULL DEFAULT false,
    "exception_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_updates" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deadline_reminders" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deadline_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "active_admission_years" TEXT[] DEFAULT ARRAY['22']::TEXT[],
    "college_code" TEXT NOT NULL DEFAULT '2SD',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "placement_season_name" TEXT NOT NULL DEFAULT 'Placement Season 2025-26',
    "active_batch" TEXT NOT NULL DEFAULT '2022 - 2026',
    "announcement_text" TEXT,
    "announcement_active" BOOLEAN NOT NULL DEFAULT false,
    "registration_open" BOOLEAN NOT NULL DEFAULT true,
    "dashboard_widgets" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "batch_year" TEXT NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "file_size" INTEGER,
    "fields" TEXT[],
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_qr_code_key" ON "attendances"("qr_code");

-- CreateIndex
CREATE INDEX "attendances_student_id_idx" ON "attendances"("student_id");

-- CreateIndex
CREATE INDEX "attendances_job_id_idx" ON "attendances"("job_id");

-- CreateIndex
CREATE INDEX "attendances_event_id_idx" ON "attendances"("event_id");

-- CreateIndex
CREATE INDEX "attendances_qr_code_idx" ON "attendances"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE INDEX "placements_user_id_idx" ON "placements"("user_id");

-- CreateIndex
CREATE INDEX "placements_tier_idx" ON "placements"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "placements_user_id_job_id_key" ON "placements"("user_id", "job_id");

-- CreateIndex
CREATE INDEX "job_updates_job_id_idx" ON "job_updates"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deadline_reminders_job_id_key" ON "deadline_reminders"("job_id");

-- CreateIndex
CREATE INDEX "backup_logs_admin_id_idx" ON "backup_logs"("admin_id");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE INDEX "applications_job_id_idx" ON "applications"("job_id");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_updates" ADD CONSTRAINT "job_updates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_logs" ADD CONSTRAINT "backup_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
