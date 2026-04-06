import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Build an Edge-safe auth handler using the Prisma-free config.
// This only decodes the JWT cookie — no DB calls happen here.
const { auth } = NextAuth(authConfig)

// Security headers applied to every response
const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, " ").trim()

// Routes that don't need auth checks
const PUBLIC_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/uploads/",
  "/login",
  "/signup",
  "/verify-email",
  "/not-authorized",
  "/sw.js",
]

// Student-only routes — admins are redirected away from these
const STUDENT_ROUTES = [
  "/dashboard",
  "/jobs",
  "/applications",
  "/schedule",
  "/attendance",
  "/documents",
  "/notifications",
  "/profile",
  "/settings",
]

const ADMIN_ROLES = new Set(["ADMIN"])

function applySecurityHeaders(response: NextResponse, isProduction: boolean) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }
  if (isProduction) {
    response.headers.set("Content-Security-Policy", cspHeader)
  }
}

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const isProduction = process.env.NODE_ENV === "production"

  // ── Skip public/static paths ─────────────────────────────────────────────
  if (
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.includes(".")
  ) {
    const res = NextResponse.next()
    applySecurityHeaders(res, isProduction)
    return res
  }

  const session = req.auth
  const role = session?.user?.role ?? null
  const isAdmin = ADMIN_ROLES.has(role ?? "")

  // ── Unauthenticated — redirect to login ──────────────────────────────────
  if (!session) {
    if (pathname !== "/") {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    const res = NextResponse.next()
    applySecurityHeaders(res, isProduction)
    return res
  }

  // ── Admin role: redirect away from root and all student routes ───────────
  if (isAdmin) {
    const isStudentRoute = STUDENT_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    )
    if (isStudentRoute || pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
  }

  // ── Non-admin: redirect away from admin routes ───────────────────────────
  if (!isAdmin && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // ── Authenticated, correct role for the route — apply security headers ───
  const res = NextResponse.next()
  applySecurityHeaders(res, isProduction)
  return res
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|sw\\.js).*)",
  ],
}
