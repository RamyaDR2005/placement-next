import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#18181B]">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#E8E5E1] bg-[#FAFAF9]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-5 sm:px-8">
          <span className="font-display text-base font-semibold tracking-tight text-[#18181B]">
            CampusConnect
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#52525B] transition-colors hover:bg-[#F4F0EB] hover:text-[#18181B]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#18181B] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#27272A] hover:shadow-md"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #18181B 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Amber glow blob */}
        <div className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-amber-100 opacity-50 blur-[100px]" />

        <div className="relative mx-auto max-w-screen-xl px-5 sm:px-8 pb-20 pt-20 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-medium text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              SDMCET Official Placement Portal
            </span>
            <h1 className="font-display mt-4 text-[2.75rem] font-semibold leading-[1.15] tracking-tight text-[#18181B] sm:text-5xl lg:text-[3.5rem]">
              Your next chapter starts{" "}
              <span className="relative">
                <span className="relative z-10">right here</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 z-0 h-3 -rotate-1 rounded bg-amber-200/70"
                  aria-hidden="true"
                />
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#71717A]">
              One platform to build your profile, connect with top companies, and
              track every step of your placement journey — from KYC to offer letter.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#18181B] px-6 text-sm font-medium text-white shadow-md transition-all hover:bg-[#27272A] hover:shadow-lg"
              >
                Create your profile
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-xl border border-[#E8E5E1] bg-white px-6 text-sm font-medium text-[#52525B] shadow-sm transition-all hover:border-[#D4CFC9] hover:bg-[#F7F5F3]"
              >
                Already registered? Sign in
              </Link>
            </div>
          </div>

          {/* Preview card strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: "500+", label: "Students Placed", color: "bg-emerald-50 border-emerald-100" },
              { value: "50+", label: "Partner Companies", color: "bg-blue-50 border-blue-100" },
              { value: "25+", label: "Active Jobs", color: "bg-violet-50 border-violet-100" },
              { value: "95%", label: "Success Rate", color: "bg-amber-50 border-amber-100" },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-5 text-center ${s.color}`}
              >
                <p className="font-display text-3xl font-semibold text-[#18181B]">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-[#71717A]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-y border-[#E8E5E1] bg-white">
        <div className="mx-auto max-w-screen-xl px-5 sm:px-8 py-16 lg:py-20">
          <div className="mx-auto max-w-xl text-center mb-12">
            <h2 className="font-display text-2xl font-semibold text-[#18181B] sm:text-3xl">
              From registration to offer — in four steps
            </h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Sign Up", desc: "Create your account with your college email address" },
              { step: "02", title: "Build Profile", desc: "Fill in academic and personal details in a guided flow" },
              { step: "03", title: "Get Verified", desc: "Submit documents for KYC verification by admin" },
              { step: "04", title: "Apply & Get Placed", desc: "Browse curated jobs and track every application" },
            ].map((s, i) => (
              <div key={s.step} className="relative flex gap-4 p-6 lg:flex-col lg:gap-3">
                {i < 3 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-[#E8E5E1] lg:block" />
                )}
                <span className="font-display shrink-0 text-4xl font-bold text-[#E8E5E1] lg:text-5xl">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#18181B]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[#71717A] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-5 sm:px-8 py-16 lg:py-24">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#18181B] sm:text-3xl">
              Everything you need,<br className="hidden sm:block" /> nothing you don't
            </h2>
          </div>
          <p className="max-w-sm text-sm text-[#71717A] leading-relaxed">
            CampusConnect is purpose-built for campus placements — no bloat, no noise. Just the tools that matter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "◎",
              title: "Guided Profile Setup",
              desc: "Build your complete professional profile in a structured 5-step flow.",
              accent: "bg-amber-50 text-amber-600",
            },
            {
              icon: "✦",
              title: "KYC Verification",
              desc: "Secure identity verification ensures only eligible students access opportunities.",
              accent: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: "⊞",
              title: "Tier-Based Jobs",
              desc: "Browse curated opportunities filtered by tier, branch, and your CGPA eligibility.",
              accent: "bg-blue-50 text-blue-600",
            },
            {
              icon: "◈",
              title: "Real-Time Tracking",
              desc: "Monitor your application from submission through interviews to the offer letter.",
              accent: "bg-violet-50 text-violet-600",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-[#E8E5E1] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#D4CFC9] hover:shadow-md"
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-base ${f.accent}`}>
                {f.icon}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-[#18181B]">{f.title}</h3>
              <p className="mt-2 text-sm text-[#71717A] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-5 sm:px-8 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#18181B] px-8 py-14 text-center sm:px-12">
          {/* Subtle pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500 opacity-10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500 opacity-10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Ready to launch your career?
            </h2>
            <p className="mt-3 text-sm text-[#A1A1AA]">
              Join hundreds of SDMCET students who found their dream jobs through CampusConnect.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-400 px-7 text-sm font-semibold text-[#18181B] shadow-lg transition-all hover:bg-amber-300 hover:shadow-xl"
              >
                Create free account
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E5E1]">
        <div className="mx-auto max-w-screen-xl px-5 sm:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-[#A1A1AA] sm:flex-row">
            <span className="font-display font-semibold text-[#52525B]">CampusConnect</span>
            <p>© {new Date().getFullYear()} SDMCET. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="transition-colors hover:text-[#18181B]">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-[#18181B]">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
