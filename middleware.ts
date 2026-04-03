import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Security headers
const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

// Content Security Policy
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
`.replace(/\s{2,}/g, ' ').trim()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Only apply CSP in production to avoid development issues
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Content-Security-Policy", cspHeader)
  }

  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/not-authorized") ||
    pathname.includes(".")
  ) {
    return response
  }

  // Get session token from cookies to check authentication without importing auth.
  // Support both NextAuth v4/v5 cookie name conventions:
  //   next-auth.*          — v4 / v5 early betas
  //   authjs.*             — v5 beta.30+ new default
  //   __Secure-*           — HTTPS variants of each
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  // If user is not authenticated, redirect to login
  if (!sessionToken) {
    if (pathname !== "/") {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // For authenticated users on admin routes, verify admin role
  // This is a basic check - full verification happens in the layout
  if (pathname.startsWith("/admin")) {
    // Let the admin layout handle the full role verification
    return response
  }

  // For authenticated users, let the page components handle profile checks
  // This avoids Edge Runtime issues with Prisma and other Node.js modules

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (file uploads)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}
