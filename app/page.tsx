import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const stats = [
  { value: "500+", label: "Students Placed" },
  { value: "50+", label: "Partner Companies" },
  { value: "25+", label: "Active Jobs" },
  { value: "95%", label: "Success Rate" },
]

const features = [
  {
    title: "Guided Profile Setup",
    description:
      "Build your professional profile with academic details, skills, and achievements in a structured step-by-step flow.",
  },
  {
    title: "KYC Verification",
    description:
      "Secure identity verification ensures only verified students access placement opportunities.",
  },
  {
    title: "Job Discovery",
    description:
      "Browse and apply to curated opportunities from top companies visiting campus, filtered by tier and eligibility.",
  },
  {
    title: "Application Tracking",
    description:
      "Monitor your application status in real-time — from submission through interviews to final selection.",
  },
]

const steps = [
  { step: "01", title: "Sign Up", description: "Create your account with your college email" },
  { step: "02", title: "Complete Profile", description: "Fill in academic and personal details" },
  { step: "03", title: "Get Verified", description: "Submit documents for KYC verification" },
  { step: "04", title: "Apply to Jobs", description: "Explore opportunities and apply with one click" },
]

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold text-sm tracking-tight">
            CampusConnect
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
        <Badge variant="secondary" className="mb-6 rounded-full px-3 py-1 text-xs font-medium">
          Trusted by 500+ students at SDMCET
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.5rem]">
          Your gateway to<br className="hidden sm:block" /> campus placements
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-neutral-500">
          The official placement portal of SDMCET. Connect with top companies,
          track your applications, and launch your career with confidence.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="px-6">Create free account</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-6">Sign in</Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-200 bg-neutral-50/60">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-neutral-900">{s.value}</div>
                <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-xl text-center mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Everything you need
          </h2>
          <p className="mt-3 text-neutral-500">
            A complete platform designed to streamline your placement journey
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors"
            >
              <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-neutral-200 bg-neutral-50/60">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-xl text-center mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 text-neutral-500">Get started in four simple steps</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-4 hidden h-px w-full bg-neutral-200 lg:block" />
                )}
                <div className="relative flex flex-col">
                  <span className="text-xs font-mono font-semibold text-neutral-400 mb-3">{s.step}</span>
                  <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-neutral-900 px-8 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
            Ready to start your career journey?
          </h2>
          <p className="mt-3 text-neutral-400">
            Join hundreds of students who found their dream jobs through CampusConnect.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="px-8">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-neutral-500">
            <span className="font-semibold text-neutral-900">CampusConnect</span>
            <p>© {new Date().getFullYear()} SDMCET. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
