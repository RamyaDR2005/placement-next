import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] grid lg:grid-cols-2">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#18181B] p-12 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Amber glow */}
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-amber-500 opacity-10 blur-3xl" />

        <Link href="/" className="relative font-display font-semibold text-base text-white tracking-tight">
          CampusConnect
        </Link>

        <div className="relative space-y-4">
          <div className="h-0.5 w-10 bg-amber-400 rounded-full" />
          <blockquote className="font-display text-xl font-medium leading-relaxed text-white">
            "CampusConnect made my placement journey smooth. I got placed in my dream company within weeks of completing my profile."
          </blockquote>
          <p className="text-sm text-white/50">— Placement Success Story</p>
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
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
