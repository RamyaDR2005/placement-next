# CampusConnect — User Manual

**CampusConnect** is the official placement management portal for SDMCET (Shri Dharmasthala Manjunatheshwara College of Engineering and Technology). It connects students, the placement office, and recruiters in a single platform — handling everything from profile submission and KYC verification to job applications, attendance tracking, placement recording, and real-time analytics.

This manual covers every screen and action for both students and placement-cell administrators.

---

## Platform Features

A quick overview of everything CampusConnect provides, grouped by area.

---

### Student-Facing Features

#### Account & Authentication
Students register with an email/password or sign in via Google OAuth. Email verification is required before first login. A batch access gate ensures only students from active admission-year cohorts can enter the portal — the placement office controls which batches are live.

#### Multi-Step Profile Builder
A five-step guided form collects every detail that recruiters and the placement office need: personal information, parent/contact details, school and engineering academic records (10th, 12th/Diploma, all semester SGPAs and CGPAs), professional links (resume, LinkedIn, GitHub, LeetCode, etc.), and skills. Progress is auto-saved after every step so students can return anytime. A **Profile Completion Score** on the dashboard shows the percentage filled.

#### KYC (Know Your Customer) Verification
Before a student can apply for any job, the placement office must verify their identity. The student uploads their college ID card as part of the profile. Admins review it and approve or reject with a reason. KYC status progresses through **Pending → Under Review → Verified / Rejected**. Only Verified students appear on recruiter views and can apply for jobs. Rejected students receive feedback and can re-submit corrected documents.

#### Job Browsing & Application
All active jobs visible to a student are displayed on the Jobs page with search and filter controls (type, work mode). Each job card shows company, role, salary, tier, and deadline. The detail page shows the full job description, eligibility criteria, and a one-click **Apply Now** button. Applications are submitted instantly — no additional form needed. Students can apply only once per job, and a unique QR code is generated for each application.

#### Tier-Based Placement Logic
Jobs are categorised into four tiers based on salary: **Tier 3** (≤5 LPA), **Tier 2** (5–9 LPA), **Tier 1** (>9 LPA), and **Dream** (>10 LPA). Once a student accepts an offer at a given tier, they are automatically blocked from applying to equal or lower-tier jobs. Dream offers bypass all tier restrictions. This policy ensures students pursue appropriate opportunities without repeatedly blocking seats at lower tiers.

#### Application Tracking
The My Applications page shows every job a student applied to, along with a live status badge (Applied → Shortlisted → Interview Scheduled → Interviewed → Selected → Offer Accepted/Rejected). Admins can also attach feedback notes and interview dates at each stage, all visible to the student in real time.

#### QR-Based Attendance
Applying for a job generates a unique QR code tied to that student and that specific application. At every round of a placement drive (aptitude test, technical interview, HR interview, etc.), coordinators scan students' QR codes to record attendance. Students carry their QR on the **My Applications** or **Attendance** page. The Attendance page shows a round-by-round timeline: which rounds they attended, timestamps, and which are pending.

#### Browser Push Notifications
Students can subscribe to browser-level push notifications from Settings. Once enabled, they receive instant alerts even when the CampusConnect tab is closed — for application status changes, new job postings, approaching deadlines, and placement-office broadcasts. The subscription can be toggled on or off at any time from **Settings → Notifications**. Notifications are delivered via the Web Push Protocol (VAPID) and work on Chrome, Firefox, Edge, and most modern mobile browsers.

#### In-App Notification Centre
A bell icon in the navigation bar shows unread notification count, refreshing every 30 seconds. The Notifications page lists all alerts in reverse chronological order with filter controls (by type and read/unread status). Students can mark all as read or delete individual notifications.

#### Schedule & Events
The Schedule page lists upcoming placement drives, pre-placement talks, aptitude tests, and interviews posted by the placement office. Events show type, date/time, duration, location, and company. The student dashboard surfaces the next four upcoming events.

#### Documents & ID Card
After KYC verification, students can download a PDF placement ID card from the Documents page or directly from the dashboard. The ID card is required for entry to on-campus placement drives.

#### Account Settings
Students can toggle push notifications, switch between light and dark mode, and change their password (email/password accounts). Google OAuth accounts manage passwords through Google directly.

---

### Admin / Placement Office Features

#### Admin Dashboard
A real-time overview of the placement season: total students, KYC-verified count, active job postings, total applications, placed students, pending KYC count, and upcoming events. Quick-action links lead to the KYC Queue, Post New Job, and Attendance Scanner.

#### Student Management
A searchable, filterable table of all student profiles. Admins can search by name, email, or USN and filter by batch, KYC status, branch, or placement status. Each row links to the full student profile. Results export to Excel (.xlsx) with selectable fields — useful for accreditation reports or sharing shortlists. Paginated at 20 records per page.

#### KYC Verification Queue
A dedicated queue showing all students with Pending or Under Review KYC status. Admins open each record, inspect the uploaded college ID card, and either Approve (status → Verified) or Reject with a written reason. The student is notified immediately via in-app alert and (if subscribed) a browser push.

#### Job Management
Admins create and manage all job postings. The job form covers job title, company (from the company directory), type (FTE/Internship), work mode, salary, tier (auto-calculated from salary), eligibility criteria (CGPA, branches, backlogs), rich-text job description, and application deadline. Jobs can be in Draft, Active, Closed, or Cancelled status. The job list has search and filter controls (status, tier, company). Admins can post announcements visible only to applicants of a specific job.

#### Applicant Pipeline Management
The applicants page for each job shows all students who applied, with their academic details and resume link. Admins move applicants through the pipeline: Shortlist → Schedule Interview (with date/time) → Mark Interviewed → Select → Accept/Reject Offer. Each transition sends an automatic notification to the student. Bulk export of selected applicants to Excel is available, with a field picker.

#### QR-Based Attendance Management
Admins create **Attendance Sessions** — each session links a job and a named round (e.g., "Round 1 – Aptitude Test"). The live scanner page shows a camera view; scanning a student's QR code records their attendance with a timestamp for that session. Duplicate scans for the same student and round are automatically rejected. The Attendance List page shows all records filterable by job, round, and date — useful for reconciling who attended each round.

#### Placement Records
Admins officially record placements once a student accepts an offer: select student, job (or enter manually), salary, and date. Recording a placement tier-locks the student automatically. The placements list is filterable by branch, batch, tier, and date range, with aggregate stats (total placed, average package, tier breakdown). Placement records can be deleted for data-correction purposes, which removes the tier lock.

#### Analytics & Reports
The Analytics page provides:
- **KPI cards**: total students, placement %, average package, total offers
- **Tier breakdown**: count and average salary per tier
- **Branch placement bar chart**: total vs. placed students per branch
- **Package distribution histogram**: how many placements fall into each salary bracket
- **Tier-wise pie chart**: proportion of placements per tier
- **Application timeline line chart**: daily application volume over 30, 60, or 90 days
- **Batch comparison cards**: side-by-side stats when two batches are active simultaneously

A batch dropdown at the top filters all charts and KPIs to a specific cohort.

#### Company-wise Analysis
A dedicated sub-page breaks down placements by company: roles posted, applications received, students shortlisted, students selected, conversion rate, average package, and last posting date. Clicking a row shows a detailed funnel. Exportable to Excel.

#### Batch Management
CampusConnect supports up to two simultaneously active batches — useful when one cohort is finishing their placement season while a new one begins. Admins create batches (name, admission year, college code), activate them when ready, and archive them when the season ends. The **Fresh Start** workflow atomically archives an active batch and creates a new Setup batch in one step — used at the start of each academic year. All historical data (profiles, applications, placements, attendance) is preserved permanently in archived batches.

#### Notifications & Push Alerts
Two communication channels in one place:
- **Browser Push**: instant device-level alerts delivered even when the portal is closed. Target all subscribers, a specific batch, or a single student by USN. A real-time preview shows how the notification will look before sending. Delivery results (sent vs. failed) are shown after dispatch.
- **In-App Bulk Notifications**: stored notifications delivered to the student's notification centre. Target all students, verified-only, by branch, by batch, or by individual IDs.

#### Company Directory
A searchable directory of all companies that have participated in or are invited for campus placements. Admins add company records (name, industry, website, logo) that are then available as selectable options when creating job postings.

#### Schedule & Events Management
Admins create placement events (drives, tests, interviews, webinars, GDs) with full details — date/time, duration, venue, company, capacity. Events can be toggled visible or hidden to students. Status transitions: Scheduled → Ongoing → Completed / Cancelled.

#### Backup & Data Export
Generate Excel exports of student data for any batch, with a configurable field set: name, USN, branch, CGPA, contact, KYC status, placement details, and more. Export history is maintained with file size, record count, and a download link. Files are stored in Cloudflare R2.

#### Site Settings
Global configuration including: active admission years (controls which USN cohorts can log in), college code, max simultaneous active batches, placement season name, registration open/closed toggle (blocks new applications site-wide), and announcement banner text.

---

## Table of Contents

### Student Guide
1. [Getting Started — Signup & Login](#1-getting-started--signup--login)
2. [Completing Your Profile](#2-completing-your-profile)
3. [KYC Verification](#3-kyc-verification)
4. [Student Dashboard](#4-student-dashboard)
5. [Browsing & Applying for Jobs](#5-browsing--applying-for-jobs)
6. [Tracking Your Applications](#6-tracking-your-applications)
7. [Attendance & QR Codes](#7-attendance--qr-codes)
8. [Notifications](#8-notifications)
9. [Schedule & Events](#9-schedule--events)
10. [Documents & ID Card](#10-documents--id-card)
11. [Account Settings](#11-account-settings)

### Admin Guide
12. [Admin Login & Navigation](#12-admin-login--navigation)
13. [Admin Dashboard](#13-admin-dashboard)
14. [Student Management](#14-student-management)
15. [KYC Queue](#15-kyc-queue)
16. [Job Management](#16-job-management)
17. [Managing Applicants & Application Statuses](#17-managing-applicants--application-statuses)
18. [Attendance Management](#18-attendance-management)
19. [Placement Records](#19-placement-records)
20. [Analytics & Reports](#20-analytics--reports)
21. [Company Management](#21-company-management)
22. [Batch Management](#22-batch-management)
23. [Schedule & Events Management](#23-schedule--events-management)
24. [Notifications & Push Alerts](#24-notifications--push-alerts)
25. [Site Settings](#25-site-settings)
26. [Backup & Data Export](#26-backup--data-export)

### Reference
27. [URL Map](#27-url-map)
28. [Common Questions & Troubleshooting](#28-common-questions--troubleshooting)

---

# Student Guide

---

## 1. Getting Started — Signup & Login

### What this section covers
How to create an account, verify your email, and sign in for the first time.

### Creating an Account

1. Open the portal in your browser.
2. Click **Sign Up** on the login page.
3. Fill in:
   - **Full name**
   - **Email address** — your college or personal email
   - **Password** — minimum 8 characters
   - **Confirm password**
   - Tick the **Terms and Conditions** checkbox
4. Click **Create Account**.
5. A verification email is sent to your address. Open it and click **Verify Email**.

> If the verification email does not arrive within a few minutes, check your Spam/Junk folder. You can also use the **Resend Verification** link on the login page.

### Logging In

**With email and password:**
1. Go to the portal login page.
2. Enter your registered email and password.
3. Click **Sign In**.

**With Google:**
1. Click **Continue with Google**.
2. Select or sign in to your Google account.
3. You are redirected to the dashboard automatically.

### Batch Access Gate

Your **University Seat Number (USN)** determines whether you can access the portal in a given placement season. The placement office activates specific admission-year batches in Settings. If your batch is not active, you will see a "Not Authorized" page after login — contact your placement coordinator to enable your batch.

---

## 2. Completing Your Profile

### What this section covers
The multi-step profile form collects all the academic, personal, and professional information that recruiters and the placement office need. You must complete your profile before applying for any job.

Your progress is saved after each step. You can leave and return at any time.

### Step 1 — Personal Information
- First name, middle name, last name
- Date of birth (day / month / year)
- Gender
- Blood group
- Nationality, state, caste category
- **Calling mobile number** (used as your primary contact)
- WhatsApp number (if different from calling mobile)
- Alternative mobile
- **Profile photo** — upload a recent passport-size photograph (JPEG/PNG)

### Step 2 — Contact & Parent Details
- Personal email address
- Current address (house no., cross, area, district, city, pincode, state)
- Permanent address (or tick "Same as current address")
- Father's name, occupation, mobile, email
- Mother's name, occupation, mobile, email

### Step 3 — Academic Details (10th / 12th / Diploma)

**10th Standard:**
- School name, location (area, district, city, state, pincode)
- Board (State / CBSE / ICSE)
- Passing month and year
- Marks type (Percentage / Subjects total / Out of 1000)
- Percentage obtained
- Marks card upload

**12th Standard or Diploma (choose one):**
- Same fields as 10th, plus board-specific fields
- For diploma: SGPA for each of 6 semesters

### Step 4 — Engineering Details
- **USN** (University Seat Number) — validated against the college code pattern; must be unique
- Branch: CSE, ISE, ECE, EEE, ME, CE, AIML, DS
- Entry type: Regular / Lateral
- Seat category: KCET / Management / COMEDK
- Residency status: Hostelite / Localite
  - Hostelite: hostel name, room number, floor
  - Localite: local city, transport mode, bus route
- Batch / academic year (e.g., "2022 – 2026")
- Branch mentor name
- Library ID

**Engineering Academic Records:**
- SGPA and CGPA for each semester (1 to 8)
- Semester marks card upload per semester
- Failed subjects (if any) with semester details
- Proof of clearance for previously failed subjects

**Professional Information:**
- Skills (tag input — add multiple)
- Resume upload (PDF)
- LinkedIn profile URL
- GitHub profile URL
- LeetCode, CodeChef, HackerRank, Codeforces, Portfolio links
- Active backlogs (yes/no) — if yes, list them

### Step 5 — Review & Submit
- Review all entered details across every section.
- Upload your **College ID card** (front and back) — this is the primary document for KYC verification.
- Upload any supporting certificates.
- Click **Submit Profile**.

> **Profile Completion Score** — Your dashboard shows a percentage score. A score of 100% means all sections are filled and KYC is verified. A higher score makes you eligible for more job postings.

---

## 3. KYC Verification

### What this section covers
KYC (Know Your Customer) is the identity-verification step that the placement office performs after you submit your profile. It ensures that all student data in the system is authentic before your profile is shown to recruiters or made eligible for job applications.

### KYC States

| Status | Meaning | What to Do |
|--------|---------|------------|
| **Pending** | Profile submitted, ID card not yet uploaded | Upload your College ID card in Profile → Step 5 |
| **Under Review** | Admin is reviewing your documents | Wait — you will receive a notification |
| **Verified** | Identity confirmed | Full access to all placement features |
| **Rejected** | Documents could not be verified | Read the admin's feedback in Notifications, fix the issue, and re-submit |

### Why KYC Matters

- You cannot apply for jobs until your KYC is **Verified**.
- Your placement ID card is only available after verification.
- Only verified students appear on certain analytics views for recruiters.

### After Rejection
1. Open the rejection notification to read the admin's feedback.
2. Go to **Profile** and correct or re-upload the requested document.
3. Save the profile — it automatically goes back to **Pending** for re-review.

---

## 4. Student Dashboard

URL: `/dashboard`

### What this section covers
The dashboard is your home screen. It summarises your placement journey at a glance.

| Section | Description |
|---------|-------------|
| **Welcome header** | Your name with quick-action buttons: Update Profile, Browse Jobs, Download ID Card |
| **Announcement banner** | Season-level announcements posted by the placement office (shown when active) |
| **Status alerts** | Contextual banners based on your KYC state — prompts you to complete your profile, wait for review, upload documents, or complete remaining fields |
| **Stats cards** | Active Jobs available to you, My Applications count, Upcoming Events, Profile Completion % |
| **Placement Journey** | For each company you applied to: application status badge, rounds attended (with timestamps), and whether you were selected or rejected |
| **Recent Job Openings** | 4 most recently posted active jobs with application deadlines |
| **Upcoming Events** | Next 4 scheduled placement drives, tests, or talks |

> The **Download ID Card** button appears only after KYC is verified.

---

## 5. Browsing & Applying for Jobs

URL: `/jobs`

### What this section covers
How to find jobs you are eligible for, understand tier restrictions, and submit an application.

### Job Listing Page

- All active jobs visible to you are displayed as cards.
- Each card shows: company name, job title, location, salary (LPA), tier badge, and application deadline.
- Use the **search bar** to filter by title or company name.
- Use the **Job Type** dropdown to filter: FTE, Internship, Training Internship.
- Use the **Work Mode** dropdown to filter: On-site, Remote, Hybrid.
- Paginate using Previous / Next buttons.

### Tier System — How Job Access Works

The platform uses a tier-based placement system to ensure fair opportunity. Once you are placed at a higher tier, you are automatically blocked from applying to lower-tier jobs.

| Tier | Package Range | Notes |
|------|--------------|-------|
| **Tier 3** | ≤ 5 LPA | Entry-level; all eligible students may apply |
| **Tier 2** | 5 – 9 LPA | Mid-range; you must not already be placed at Tier 2 or above |
| **Tier 1** | > 9 LPA | High-package; you must not already be placed at Tier 1 |
| **Dream Offer** | > 10 LPA | Marked by admin; bypasses all tier restrictions |

**Example:** If you receive a Tier 2 offer (8 LPA), you are blocked from applying to Tier 2 or Tier 3 jobs in the future. You can still apply to Tier 1 and Dream jobs.

### Eligibility Indicators

Jobs you are not eligible for are shown with a lock icon and an explanation:
- **CGPA too low** — your CGPA is below the minimum requirement
- **Branch not allowed** — your branch is not in the job's allowed branches list
- **Already placed at this tier** — tier restriction applies
- **Backlogs not allowed** — the job does not permit any backlogs
- **Registration closed** — the placement office has closed applications for the season

### Job Detail Page

URL: `/jobs/[id]`

Click any job card to open its detail page:
- Full job description (formatted rich text)
- Salary (LPA), location, work mode, job type
- Eligibility criteria: minimum CGPA, allowed branches, eligible batch, max backlogs
- Required and preferred skills
- Application deadline and number of positions
- Company updates and announcements (posted by admin)

### Applying for a Job

1. On the job detail page, click **Apply Now**.
2. The application is submitted instantly — no cover letter or additional form is needed.
3. A unique QR code is generated for your application automatically.
4. You receive an in-app notification confirming your application.

> You can only apply once per job. The button changes to **Applied** after submission. The QR code is available in **My Applications** and is used for attendance scanning at placement drives.

---

## 6. Tracking Your Applications

URL: `/applications`

### What this section covers
How to monitor the progress of all your job applications and understand each status.

### My Applications Page

Lists all jobs you have applied for, showing:
- Company name and job title
- Date you applied
- **Status badge** — your current stage in that company's hiring process
- Admin feedback (shown when provided by the placement office)
- Interview date (shown when scheduled)
- Your **QR code** for that application (tap to enlarge; used for attendance scanning)

### Application Status Lifecycle

```
APPLIED → SHORTLISTED → INTERVIEW SCHEDULED → INTERVIEWED → SELECTED
                                                                  │
                                                    OFFER ACCEPTED / OFFER REJECTED

Any stage can transition to → REJECTED
```

| Status | What It Means |
|--------|--------------|
| **Applied** | Application received by the placement office |
| **Shortlisted** | You have been shortlisted to proceed to the next round |
| **Interview Scheduled** | An interview has been booked; check the date shown on the card |
| **Interviewed** | Your interview is recorded; result is pending |
| **Selected** | You have been selected for the offer |
| **Offer Accepted** | Placement confirmed; you are now tier-locked accordingly |
| **Offer Rejected** | You declined the offer, or it was withdrawn |
| **Rejected** | Not selected at this stage |

You receive an in-app notification every time your status changes. If you have push notifications enabled, a browser alert is also sent.

---

## 7. Attendance & QR Codes

URL: `/attendance`

### What this section covers
How the QR-based attendance system works and how to present your QR code at placement drives.

### How Attendance Works

When you apply for a job, the system generates a unique QR code for that specific application. This QR code is your digital entry pass for every round of the placement process for that company.

At each placement round (aptitude test, technical interview, HR interview, etc.), a placement coordinator will scan your QR code using the admin scanner. Once scanned, your attendance for that round is recorded automatically.

### Finding Your QR Codes

1. Go to **My Applications** (`/applications`).
2. Locate the job you are attending.
3. Tap or click the **QR Code** icon on the application card to enlarge it.
4. Show this QR code to the coordinator for scanning.

**OR**

1. Go to **Attendance** (`/attendance`) from the sidebar.
2. All your QR codes are listed here, one per applied job, along with:
   - Company name and job title
   - Rounds attended (with scan timestamps)
   - Rounds pending

### Tips

- Keep your QR code readily accessible on your phone before entering the venue.
- The QR code is unique to you and the job — it cannot be shared or used by another student.
- Even if your status is still "Applied," you may be asked to scan in if you are shortlisted during the event.
- If you cannot display the QR code (phone battery dead, etc.), inform the coordinator so they can manually record your attendance.

---

## 8. Notifications

URL: `/notifications`

### What this section covers
The two types of notifications you receive — in-app and browser push — and how to manage them.

### In-App Notifications

The bell icon in the top navigation shows a count of unread notifications. It refreshes every 30 seconds.

**Notifications Page:**
- Lists all notifications in reverse chronological order.
- Filter by type (Application Status, Interview Scheduled, Job Posted, KYC Update, System) or by read/unread.
- Click a notification to mark it as read and navigate to the relevant page.
- **Mark All as Read** clears the unread count instantly.
- Delete individual notifications using the trash icon.

### Browser Push Notifications

Push notifications appear as browser-level alerts even when the CampusConnect tab is closed. They are supported on Chrome, Firefox, Edge, and most modern mobile browsers.

**Enabling Push Notifications:**
1. Go to **Settings** → **Notifications**.
2. Click **Enable Push Notifications** (or **Enable** in the toggle).
3. Allow the browser permission prompt that appears.
4. A confirmation message appears when successfully subscribed.

**If you see "Notifications Blocked":**
Your browser has denied permission. To re-enable:
- **Chrome/Edge:** Click the lock icon in the address bar → Site Settings → Notifications → Allow.
- **Firefox:** Click the shield icon → Notifications → Allow.

**What triggers a push notification:**
- Your application status changes (shortlisted, interview scheduled, selected, rejected)
- A new job is posted that matches your profile
- A placement deadline is approaching (6 hours before cutoff)
- A message is broadcast by the placement office

---

## 9. Schedule & Events

URL: `/schedule`

### What this section covers
Placement-related events posted by the placement office — drives, tests, pre-placement talks.

- Each event shows: title, date/time, type (placement drive, test, interview, webinar, etc.), location or online link.
- Click an event for full details.
- The dashboard's **Upcoming Events** card shows the next 4 events.
- Events are listed in chronological order. Past events are visible with a "Completed" or "Cancelled" badge.

> Attendance at events (e.g., a placement drive) is tracked using the QR code for the related job application — not through the schedule page directly.

---

## 10. Documents & ID Card

URL: `/documents`

### What this section covers
Downloading your placement ID card, which is required for entry to on-campus placement drives.

- Available **only after KYC is Verified**.
- The ID card is a PDF generated from your profile data.
- Download it using the **Download ID Card** button on this page or on the dashboard.
- Carry a printout or have it ready on your phone for every placement event.

---

## 11. Account Settings

URL: `/settings`

### Notifications Tab
- Toggle **Push Notifications** on or off.
- If toggled off, the browser subscription is removed. You will no longer receive push alerts.
- Push notifications require HTTPS and a compatible browser. They do not work in Incognito / Private mode.

### Appearance Tab
- Switch between **Light** and **Dark** mode using the theme toggle.

### Security Tab

**For email/password accounts:**
1. Enter your **Current Password**.
2. Enter and confirm your **New Password** (minimum 8 characters).
3. Click **Update Password**.

**For Google (OAuth) accounts:**
- Password management is handled by Google. The security section shows a message indicating this.

---

# Admin Guide

---

## 12. Admin Login & Navigation

### What this section covers
Admins log in through the same page as students. The portal detects the ADMIN role and switches to admin navigation automatically.

### Admin Sidebar

| Menu Item | URL | Purpose |
|-----------|-----|---------|
| Dashboard | `/admin` | Overview stats and quick actions |
| Students | `/admin/students` | Search, filter, and manage all student profiles |
| KYC Queue | `/admin/students/kyc` | Review and approve/reject pending verifications |
| Jobs | `/admin/jobs` | Create, edit, search, and filter job postings |
| Placements | `/admin/placements` | Record official placements and view history |
| Analytics | `/admin/analytics` | Placement % and package charts, batch comparison |
| Companies | `/admin/analytics/companies` | Company-wise placement analysis |
| Schedule | `/admin/schedule` | Create and manage placement events |
| Attendance | `/admin/attendance` | Manage QR sessions and view attendance logs |
| Attendance Scan | `/admin/attendance/scan` | Live QR scanner for real-time check-in |
| Notifications | `/admin/notifications` | Send in-app and push notifications to students |
| Companies | `/admin/companies` | Add and manage company records |
| Batch Management | `/admin/batches` | Activate batches, run fresh-start for new cohorts |
| Backup | `/admin/backup` | Export student data to Excel |
| Settings | `/admin/settings` | Site configuration, batch access control |

---

## 13. Admin Dashboard

URL: `/admin`

### What this section covers
A real-time overview of the placement season.

| Card | Metric |
|------|--------|
| Total Students | All registered student accounts |
| Verified Students | Students with KYC Verified |
| Active Job Postings | Jobs currently open for applications |
| Total Applications | All submitted (non-removed) applications |
| Placed Students | Officially recorded placements |
| Upcoming Interviews | Events scheduled in the next 7 days |
| Pending KYC | Profiles awaiting verification |

The dashboard also shows:
- **Announcement banner** — if an announcement is active in Settings
- Quick links to KYC Queue, Post New Job, and Attendance Scan

---

## 14. Student Management

URL: `/admin/students`

### What this section covers
Finding, filtering, and reviewing student profiles. All filtering happens server-side — the URL updates to reflect your current filters, and you can bookmark or share any filtered view.

### Search & Filters

| Filter | How It Works |
|--------|-------------|
| **Search bar** | Searches name, email, and USN simultaneously. Results update as you type (debounced 300ms). |
| **Batch** | Dropdown of active batches; filters to students assigned to that batch. |
| **KYC Status** | Filter to Pending / Under Review / Verified / Rejected. |
| **Branch** | Filter to a specific engineering branch (CSE, ISE, ECE, etc.). |
| **Placement** | Filter to Placed or Unplaced students. |
| **Clear** | Removes all active filters in one click. |

### Student Table Columns

Each row shows: Name + email, USN, Branch, CGPA, KYC status badge, Applications count, Placement info (company + package if placed), and date joined.

### Exporting

Click **Export** to download the current filtered view as an Excel (.xlsx) file. The export includes name, email, USN, branch, batch, KYC status, CGPA, phone, total applications, placement status, company, package, and tier.

### Pagination

Results are paginated at 20 students per page. Use the Previous / Next buttons or the page indicator to navigate. The total count is shown above the table.

---

## 15. KYC Queue

URL: `/admin/students/kyc`

### What this section covers
Reviewing student identity documents and approving or rejecting KYC submissions.

### Review Process

1. The page lists all students with **Pending** or **Under Review** KYC status.
2. Click a student to view their full profile and the uploaded College ID card.
3. Inspect the document — confirm the student name, USN, and college name are clearly visible.
4. Choose an action:

**Approve:**
- Click **Approve KYC**.
- Status changes to **Verified**.
- Student receives an in-app notification and (if subscribed) a browser push.

**Reject:**
- Click **Reject KYC**.
- Enter a rejection reason (e.g., "ID card is blurry, please resubmit a clear scan").
- Click **Confirm Reject**.
- Status returns to **Pending** and the student receives a notification with your feedback.

### Best Practices

- Always provide a clear rejection reason so the student knows exactly what to fix.
- Check both sides of the ID card — the USN and college name must be legible.
- If a student's name on the portal does not match the ID card, reject and ask them to correct their profile first.

---

## 16. Job Management

URL: `/admin/jobs`

### What this section covers
Creating, editing, searching, and managing all job postings.

### Job List — Search & Filters

| Filter | Options |
|--------|---------|
| **Search** | Search by job title or company name (debounced, server-side) |
| **Status** | Active / Draft / Closed / Cancelled |
| **Tier** | Dream / Tier 1 / Tier 2 / Tier 3 |

Results are paginated at 15 per page. The total filtered count is shown. Clear all filters with the **Clear** button.

### Job Status Values

| Status | Meaning |
|--------|---------|
| **Active** | Published and open for student applications |
| **Draft** | Saved but not visible to students |
| **Closed** | No longer accepting applications |
| **Cancelled** | Cancelled and hidden from all views |

### Creating a Job

URL: `/admin/jobs/new`

**Basic Details:**
- Job title
- Company — select from existing company records or type a new name
- Job type: FTE (Full-Time Employment), Internship, Training Internship
- Work mode: On-site, Remote, Hybrid
- Location
- Number of positions

**Compensation & Tier:**
- Salary (LPA) — the tier is calculated automatically:
  - ≤ 5 LPA → Tier 3
  - 5–9 LPA → Tier 2
  - > 9 LPA → Tier 1
- Toggle **Is Dream Offer** to mark as Dream (> 10 LPA, bypasses tier restrictions)

**Eligibility Criteria:**
- Minimum CGPA
- Allowed branches — leave empty to allow all branches
- Eligible batch year
- Maximum active backlogs allowed
- Required skills

**Job Description:** Rich text editor with formatting, bullet lists, and links.

**Deadline:** Date and time picker. Students receive an automatic deadline reminder push/in-app notification 6 hours before cutoff.

**Visibility:** Set to **Draft** to save without publishing, or change status to **Active** to publish immediately.

### Editing a Job

URL: `/admin/jobs/[id]/edit`

Same form as creation. You can change any field at any time, including status (e.g., Active → Closed if applications are full, Draft → Active to publish later).

### Job Announcements

From the job's applicants page, use the **Updates** panel to post announcements visible to all applicants of that job (e.g., "Venue for Round 2 has changed to Hall A").

---

## 17. Managing Applicants & Application Statuses

URL: `/admin/jobs/[id]/applicants`

### What this section covers
Reviewing who applied for a specific job, moving them through the hiring pipeline, and exporting data.

### Applicants Table

Each row shows: student name, email, USN, branch, CGPA, current status badge, application date, and resume link.

**Bulk actions:**
- Check individual rows or use **Select All**.
- **Export** selected rows to Excel (.xlsx) — choose fields using the Fields dropdown.
- **Remove** selected applicants (soft delete with an optional reason).

### Updating Application Status

Each row has a status action button (right side). Only valid transitions for the current status are shown:

| Current Status | Available Next Steps |
|---------------|---------------------|
| Applied | Shortlist, Reject |
| Shortlisted | Schedule Interview, Reject |
| Interview Scheduled | Mark Interviewed, Reject |
| Interviewed | Select, Reject |
| Selected | Offer Accepted, Offer Rejected |

Clicking a transition opens a confirmation dialog. For **Schedule Interview**, enter the interview date and time. For **Reject**, enter an optional reason. All transitions trigger an automatic in-app notification to the student.

### Removing an Applicant

Removing is a **soft delete** — the record is hidden from the active list but preserved for audit. The removal reason is logged. Removed applicants can be restored using the **Restore** action.

---

## 18. Attendance Management

### What this section covers
The QR-based attendance system tracks student presence at each round of a placement drive. Each student gets a unique QR code per job application. Admin coordinators scan these codes at the venue using the built-in scanner.

### How the System Works

1. A student applies for a job → their unique QR code is generated.
2. At the placement drive, the admin opens the **Attendance Scanner**.
3. The coordinator scans each student's QR code at each round.
4. The scan is time-stamped and linked to the student, job, and round.
5. Students can view their round-by-round attendance timeline on the **Attendance** page and on their dashboard.

### Creating an Attendance Session

URL: `/admin/attendance`

Before scanning, create a session that defines which job and round is being recorded:

1. Click **New Session**.
2. Select the **Job** (company + role).
3. Enter the **Round name** (e.g., "Round 1 – Aptitude Test", "Round 2 – Technical Interview").
4. Click **Create Session**.

A session can be left open while scanning is in progress and closed when the round ends.

### Live QR Scanning

URL: `/admin/attendance/scan`

1. Open this page on a device with a camera (laptop webcam or phone).
2. Select the active **Session** (job + round) from the dropdown.
3. Point the camera at the student's QR code (displayed on their phone from the **My Applications** page).
4. The system verifies the application in real time:
   - **Green tick** — scan successful, attendance recorded with timestamp.
   - **Red alert** — QR code not recognised, wrong job, or already scanned for this round.
5. Duplicate scans for the same round are automatically rejected.

### Attendance List & Reports

URL: `/admin/attendance/list`

- View all attendance records for any job and round.
- Filter by job, round, or date.
- See which students attended, which did not, and exact scan timestamps.
- Useful for reconciling shortlisted students between rounds.

### Student View

Students see their attendance timeline on:
- **Dashboard** → Placement Journey card (rounds attended shown as green ticks)
- **Attendance page** (`/attendance`) → QR codes and round-by-round status per job

---

## 19. Placement Records

URL: `/admin/placements`

### What this section covers
Officially recording a student's placement offer — this is the final confirmation step after a student accepts an offer.

### Viewing Placements

Lists all recorded placements with: student name, branch, batch, company, role, package (LPA), tier, and placement date.

**Filters:** branch, batch, tier, date range.

**Stats panel:** total placed count, average package, tier breakdown.

### Recording a Placement

1. Click **Record Placement**.
2. Search for and select the student.
3. Select the job (or enter company/role manually if not in the system).
4. Enter salary (LPA) and placement date.
5. Click **Save**.

> Recording a placement automatically **tier-locks** the student. They will be blocked from applying to lower-tier jobs going forward. For Dream offers, the student may still apply to other Dream jobs.

### Deleting a Placement Record

Click the delete icon on a placement row. This removes the record and unlocks the student's tier restrictions. Use with care — this is intended for data-correction situations only.

---

## 20. Analytics & Reports

URL: `/admin/analytics`

### What this section covers
Comprehensive placement statistics with charts, batch comparisons, and company-level breakdowns.

### Batch Filter

At the top of the page, filter all metrics by a specific active batch (e.g., "2022-2026") or view aggregate data across all batches. When two batches are active simultaneously, a side-by-side batch comparison card is shown automatically.

### KPI Cards (top row)

| Card | What It Shows |
|------|--------------|
| Total Students | Students in the selected batch (or all batches) |
| Placement % | Placed students ÷ total students × 100 |
| Avg Package | Average salary (LPA) across all placement records |
| Total Offers | Applications with SELECTED or OFFER_ACCEPTED status |

### Tier Breakdown Row

Four cards showing count and average salary for each tier: Dream, Tier 1, Tier 2, Tier 3.

### Charts

**Branch Placement Bar Chart:**
- Bars comparing total students vs. placed students for each engineering branch.
- When two batches are active, each batch gets its own grouped bar.

**Package Distribution Histogram:**
- Shows how many students were placed in each salary bracket: < 3 LPA, 3–5, 5–7, 7–9, 9–12, 12+ LPA.
- Quickly identify whether most placements are entry-level or above.

**Tier-wise Pie Chart:**
- Proportion of placements in each tier (Dream, Tier 1, Tier 2, Tier 3).

**Application Timeline (Line Chart):**
- Daily application counts over the last 30, 60, or 90 days.
- Use the **30d / 60d / 90d** toggle buttons to change the window.
- Peaks typically correspond to job posting dates.

**Batch Comparison (shown when 2 active batches):**
- Side-by-side cards for each active batch showing: total students, placed count, placement %, and average package.

### Company-wise Analysis

URL: `/admin/analytics/companies`

Click **Company-wise Analysis** from the analytics page to open a detailed breakdown by company:

| Column | Description |
|--------|-------------|
| Company | Company name |
| Roles | Number of distinct job roles posted |
| Applications | Total applications received |
| Shortlisted | Students who reached the shortlisting stage |
| Selected | Students who received offers |
| Conversion | Selected ÷ Applications × 100 (shown as a badge) |
| Avg Package | Average of min and max salary across the company's jobs |
| Last Posted | Date of the most recent job from this company |

**Click any row** to open a side drawer with:
- All metrics for that company
- List of roles posted
- Application pipeline funnel (applied → shortlisted → selected, shown as a visual bar)

**Search:** Filter the table by company name using the search bar.

**Export:** Click **Export** to download the full company report as an Excel file.

---

## 21. Company Management

URL: `/admin/companies`

### What this section covers
Maintaining a directory of companies that participate in campus placements.

- Lists all registered companies with name, industry, website, and active status.
- Click **Add Company** to create a new record:
  - Company name (must be unique), industry, website URL, logo URL, description
- Click a company name to view or edit its details.
- Companies appear as selectable options when creating job postings — selecting a company auto-fills the company name and logo on the job.
- A company can only be deleted if no jobs are linked to it.

---

## 22. Batch Management

URL: `/admin/batches`

### What this section covers
CampusConnect supports up to **two simultaneous active batches** — for example, the 2021–2025 batch finishing their placements while the 2022–2026 batch begins theirs. Batch Management lets you create, activate, archive, and do a fresh start for any cohort.

### Batch Statuses

| Status | Meaning |
|--------|---------|
| **Setup** | Batch has been created but not yet live. Students cannot access it. Use this to configure the batch before the season begins. |
| **Active** | The batch is live. Students assigned to it can log in and use the portal. Maximum 2 batches can be Active at the same time. |
| **Archived** | The batch's season is over. All student records are preserved for historical reporting, but no new activity is permitted. |

### Creating a New Batch

1. Go to **Batch Management** (`/admin/batches`).
2. Click **New Batch**.
3. Enter:
   - **Batch name** (e.g., "2022–2026")
   - **Admission year** — the 2-digit suffix of the USN for students in this batch (e.g., "22" for USNs like `2SD22CS001`)
   - **College code** (defaults to "2SD")
4. Click **Create**. The batch is created in **Setup** status.

### Activating a Batch

1. From the batch list, click the **Activate** button on a Setup or Archived batch.
2. The system checks that fewer than 2 batches are currently Active.
3. If the limit is reached, an error is shown — archive an existing batch first.
4. On success, the batch goes **Active** and its `startedAt` timestamp is recorded.

### Archiving a Batch

1. Click **Archive** on an Active batch.
2. Confirm the action.
3. The batch is marked **Archived** with an `archivedAt` timestamp.
4. All student records in that batch are preserved; students can no longer log in under that batch's access gate.

### Fresh Start (New Batch Onboarding)

The **Fresh Start** workflow allows you to close out a batch and set up a new one in a single atomic step. Use this at the start of a new academic year.

1. Click **Fresh Start** on an Active or Setup batch.
2. Enter the details for the new batch:
   - New batch name (e.g., "2023–2027")
   - New admission year (e.g., "23")
3. Click **Confirm**.

What happens:
- The selected batch is **archived** immediately.
- A new batch in **Setup** status is created with the details you provided.
- All existing student records in the archived batch are fully preserved — no data is deleted.
- Students in the new batch year will be able to register and be assigned to the new batch.

> **Note:** The Fresh Start does not delete any student profiles, applications, placements, or attendance records. It is purely a status transition.

### Batch Assignment for Students

Students are assigned to a batch when their USN admission year matches the batch's `admissionYear` field. This assignment can also be set manually from the student's profile. Only students assigned to an **Active** batch can log in and access placement features.

---

## 23. Schedule & Events Management

URL: `/admin/schedule`

### What this section covers
Creating and managing placement events that are visible to students.

### Creating an Event

1. Click **Add Event**.
2. Fill in:
   - Title
   - Event type: Interview, Test, Group Discussion, Presentation, Meeting, Webinar
   - Date and time
   - Duration (minutes)
   - Location or online meeting link
   - Company name (optional)
   - Maximum attendees (optional)
   - Description
3. Toggle **Visible to Students** to control student-facing visibility.
4. Click **Save**.

### Managing Events

- Edit any event by clicking the edit icon.
- Delete an event using the delete icon.
- Change event status: Scheduled → Ongoing → Completed / Cancelled.
- View the attendee list for any event.

---

## 24. Notifications & Push Alerts

URL: `/admin/notifications`

### What this section covers
Two channels for communicating with students: **in-app notifications** (stored in the database, visible in the notification bell) and **browser push notifications** (delivered instantly to the device even when the tab is closed).

The notification count at the top of the page shows how many students have push notifications enabled — useful for estimating push delivery reach.

---

### A. Send Browser Push Notification

Push notifications are delivered instantly to subscribed browsers. They work even when the portal tab is closed.

**Form fields:**
- **Title** (max 50 characters) — the notification headline
- **Message** (max 120 characters) — the notification body text
- **URL on click** (optional) — the page to open when the student taps the notification (e.g., `/jobs` or `/dashboard`)
- **Target:**
  - **All Subscribers** — sends to every student who has enabled push notifications
  - **By Batch** — sends only to subscribers in a specific active batch (useful when running two batches simultaneously)
  - **By USN** — sends to a single student; enter their USN

**Preview panel:** A real-time preview shows how the notification will appear in the browser before you send.

**After sending:** A result badge shows how many devices received the notification and how many failed (failed = stale/expired subscription, automatically cleaned up).

> Only students who have enabled push notifications from Settings will receive them. Students who have blocked notifications or have never subscribed will not receive them.

---

### B. Send In-App Notification (Bulk)

In-app notifications appear in the student's notification bell and notifications page.

**Form fields:**
- **Title** — short subject line
- **Message** — full notification body
- **Notification Type** — Job Posted, Application Status, System, Event Reminder, etc.
- **Target Audience:**
  - All students
  - Verified students only
  - By specific branch (e.g., CSE only)
  - By batch year
  - Specific student IDs

Click **Send**. All targeted students receive the notification immediately in their in-app notification centre.

**Stats Panel (right side):**
- Total notifications sent in the selected period
- Read rate %
- Breakdown by notification type
- Recent notification history

---

## 25. Site Settings

URL: `/admin/settings`

### What this section covers
Global configuration for the placement portal — batch access control, season settings, and registration status.

### Batch Access Control

Controls which student cohorts can access the portal based on their USN year.

| Setting | Description |
|---------|-------------|
| **Active Admission Years** | Comma-separated 2-digit year suffixes (e.g., `22, 23`). Students whose USN matches an active year can log in. Remove a year to lock out that cohort. |
| **College Code** | USN prefix used to validate USN format (e.g., `2SD`). Must match the institutional USN format. |
| **Max Active Batches** | Maximum number of batches that can be Active simultaneously (default: 2). |

Click **Save Batch Settings** to apply. Changes take effect immediately — students in deactivated years will see the "Not Authorized" page on their next login.

### Site Configuration

| Setting | Description |
|---------|-------------|
| **Placement Season Name** | Display name shown on dashboards and notifications (e.g., "2025-26 Placement Season") |
| **Active Batch** | The batch label used for batch-level stats on the admin dashboard |
| **Registration Open** | Toggle — when OFF, students cannot submit new job applications (use during off-season or between posting rounds) |
| **Announcement Active** | Toggle — when ON, the announcement text appears as a banner on both student and admin dashboards |
| **Announcement Text** | The text to display in the announcement banner |

Click **Save Site Settings** to apply. Changes take effect immediately.

---

## 26. Backup & Data Export

URL: `/admin/backup`

### What this section covers
Exporting student and placement data to Excel for offline analysis, accreditation reports, or archiving.

### Creating a Backup

1. Select the **Batch Year** to export.
2. Check the **Fields** to include: name, USN, branch, CGPA, contact info, placement details, KYC status, etc.
3. Click **Start Backup**.
4. The system generates an Excel file. When complete, the status shows **Completed** and a **Download** link appears.

### Backup History

| Column | Description |
|--------|-------------|
| Date | When the backup was initiated |
| Batch Year | Cohort exported |
| Status | Pending / Completed / Failed |
| Record Count | Number of student records included |
| File Size | Size of the generated file |
| Admin | Who triggered the backup |
| Actions | Download (if Completed) |

> Files are stored in Cloudflare R2. Download links may expire — re-generate a backup if the link is no longer valid.

---

## 27. URL Map

### Student Pages

| Page | URL |
|------|-----|
| Home / Landing | `/` |
| Login | `/login` |
| Signup | `/signup` |
| Email Verification | `/verify-email` |
| Not Authorized | `/not-authorized` |
| Dashboard | `/dashboard` |
| Complete / Edit Profile | `/profile` |
| Browse Jobs | `/jobs` |
| Job Detail | `/jobs/[id]` |
| My Applications | `/applications` |
| My Attendance & QR Codes | `/attendance` |
| Notifications | `/notifications` |
| Schedule | `/schedule` |
| Documents & ID Card | `/documents` |
| Account Settings | `/settings` |

### Admin Pages

| Page | URL |
|------|-----|
| Admin Dashboard | `/admin` |
| Students (filtered) | `/admin/students` |
| KYC Queue | `/admin/students/kyc` |
| Job Management | `/admin/jobs` |
| Post New Job | `/admin/jobs/new` |
| Edit Job | `/admin/jobs/[id]/edit` |
| Job Applicants | `/admin/jobs/[id]/applicants` |
| Placements | `/admin/placements` |
| Analytics | `/admin/analytics` |
| Company-wise Analysis | `/admin/analytics/companies` |
| Attendance Management | `/admin/attendance` |
| Attendance List | `/admin/attendance/list` |
| Attendance Scanner | `/admin/attendance/scan` |
| Placements | `/admin/placements` |
| Schedule | `/admin/schedule` |
| Notifications | `/admin/notifications` |
| Company Directory | `/admin/companies` |
| Batch Management | `/admin/batches` |
| Backup & Export | `/admin/backup` |
| Settings | `/admin/settings` |

---

## 28. Common Questions & Troubleshooting

**Q: I verified my email but see "Not Authorized" after login.**  
A: Your admission year (based on USN) is not in the active years list. Contact the placement cell to check if your batch is enabled in Settings → Batch Access Control.

**Q: A job shows as locked even though my CGPA meets the requirement.**  
A: Check that (1) your branch is in the job's allowed branches, (2) you are not already placed at that tier or above, (3) your profile's branch and CGPA fields are filled in and your profile is complete.

**Q: I applied for a job but don't see it in My Applications.**  
A: Refresh the page. If the job still does not appear, the admin may have removed the application. Contact the placement office.

**Q: I'm not receiving push notifications.**  
A: (1) Confirm you have granted notification permission — go to browser Site Settings and check that Notifications is set to "Allow" for this site. (2) Push notifications do not work in Incognito/Private mode. (3) If you see "Notifications Blocked" in Settings, you need to manually re-allow in the browser.

**Q: My QR code was scanned but my attendance is not showing.**  
A: Ask the coordinator to confirm which Session (job + round) was active when they scanned. If the wrong session was selected, the scan may have been rejected. Contact the placement office to manually record the attendance.

**Q: My KYC was rejected. What document should I upload?**  
A: Read the rejection reason in your notification. Typically, a clear scan or photo of your **College ID card** is required — both sides, with college name and USN clearly readable, not blurry or cropped.

**Q: The "Apply Now" button is greyed out.**  
A: One of these applies: (a) your KYC is not yet Verified, (b) you do not meet the eligibility criteria (CGPA, branch, backlogs), (c) you are already placed at this tier or above, or (d) the placement office has closed registrations for the season.

---

**Q (Admin): I closed a job by mistake.**  
A: Go to `/admin/jobs/[id]/edit`, change Status to **Active**, and save.

**Q (Admin): How do I re-open applications after closing them site-wide?**  
A: Go to `/admin/settings` → Site Configuration → toggle **Registration Open** to ON → click **Save Site Settings**.

**Q (Admin): I activated a third batch and got an error.**  
A: The system enforces a maximum of 2 simultaneously Active batches (configurable in Settings → Max Active Batches). Archive one of the existing Active batches before activating a new one.

**Q (Admin): A student's QR code scan was rejected with "wrong job".**  
A: The student's QR code is tied to a specific job application. Confirm that the scanner's active Session matches the job the student applied to. If the student applied to the correct job, their QR code should be valid — check if the session was created for the right job.

**Q (Admin): Push notifications show 0 delivered.**  
A: (1) Confirm VAPID keys are set in `.env` (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`). (2) The target audience may not have push enabled — the subscriber count at the top of the Notifications page shows how many students are subscribed.

**Q (Admin): How do I send a push notification to just one student?**  
A: On the Notifications page, in the Push section, set **Target** to "By USN" and enter the student's USN.

---

*Last updated: April 2026 — CampusConnect v1.1*
