import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe NextAuth config — no Prisma, no bcrypt, no Node.js-only imports.
 * Used by middleware.ts (Edge Runtime) to decode the JWT and read session data.
 *
 * The full config (lib/auth.ts) extends this with the PrismaAdapter,
 * CredentialsProvider, and the DB-backed jwt callback.
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * Minimal jwt callback — only runs in middleware context.
     * The full DB-backed version in auth.ts overrides this for server usage.
     */
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "STUDENT"
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as string) ?? "STUDENT"
        session.user.usn = (token.usn as string | null | undefined) ?? null
      }
      return session
    },
  },
  providers: [], // providers live in auth.ts only (bcrypt not Edge-safe)
} satisfies NextAuthConfig
