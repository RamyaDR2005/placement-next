import { SignupForm } from "@/components/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] grid lg:grid-cols-2">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#18181B] p-12 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-amber-500 opacity-10 blur-3xl" />

        <Link href="/" className="relative font-display font-semibold text-base text-white tracking-tight">
          CampusConnect
        </Link>

        <div className="relative space-y-5">
          <div className="h-0.5 w-10 bg-amber-400 rounded-full" />
          <h2 className="font-display text-2xl font-semibold leading-snug text-white">
            Start your placement journey today
          </h2>
          <p className="text-sm leading-relaxed text-white/60">
            Join 500+ students who have successfully navigated their career path with CampusConnect.
            Build your profile, apply to curated jobs, and track every step to your offer letter.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {["500+ placed", "50+ companies", "95% success"].map((s) => (
              <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/30">
          © {new Date().getFullYear()} SDMCET. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="font-display font-semibold text-base text-[#18181B] lg:hidden mb-6 block">
            CampusConnect
          </Link>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
