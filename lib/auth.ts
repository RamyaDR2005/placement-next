import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import { logSecurityEvent } from "@/lib/auth-helpers"
import { authConfig } from "@/lib/auth.config"

// Ensure JWT secret is set
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set")
}

// How often to re-check role in the DB during token rotation.
// Role changes (e.g. STUDENT → ADMIN) will propagate within this window
// without requiring a re-login.
const ROLE_REFRESH_INTERVAL_SECONDS = 60 * 60 // 1 hour

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        if (email.length > 255 || password.length > 255) return null

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        })

        if (!user || !user.password) {
          // Constant-time comparison to prevent user enumeration
          await bcrypt.compare(
            password,
            "$2a$10$invalidhashtopreventtimingattacks12345678901234567890123"
          )
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) return null

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // ── Initial sign-in ─────────────────────────────────────────────────
      if (user) {
        token.role = (user as { role?: string }).role ?? "STUDENT"
        token.id = user.id
        token.roleCheckedAt = Math.floor(Date.now() / 1000)

        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { usn: true },
        })
        token.usn = profile?.usn ?? null
        return token
      }

      // ── Explicit session update (e.g. client calls update()) ─────────────
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true, email: true, name: true, image: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
        }

        const profile = await prisma.profile.findUnique({
          where: { userId: token.sub! },
          select: { usn: true },
        })
        token.usn = profile?.usn ?? null
        token.roleCheckedAt = Math.floor(Date.now() / 1000)
        return token
      }

      // ── Periodic role refresh (token rotation) ───────────────────────────
      // Re-fetch role from DB at most once per ROLE_REFRESH_INTERVAL_SECONDS.
      // This ensures role promotions (e.g. STUDENT → ADMIN) take effect
      // within 1 hour without requiring the user to re-login.
      const now = Math.floor(Date.now() / 1000)
      const lastCheck = (token.roleCheckedAt as number) ?? 0

      if (now - lastCheck > ROLE_REFRESH_INTERVAL_SECONDS) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
        token.roleCheckedAt = now
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as string) ?? "STUDENT"
        session.user.email = token.email!
        session.user.name = token.name
        session.user.image = token.picture
        session.user.usn = (token.usn as string | null | undefined) ?? null
      }
      return session
    },

    async signIn({ account }) {
      // Google emails are pre-verified; credentials auth checks in authorize()
      if (account?.provider === "google") return true
      return true
    },
  },

  events: {
    async createUser({ user }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
        if (dbUser && !dbUser.emailVerified) {
          await sendVerificationEmail(user.email, user.name || "User")
        }
      }
    },
    async signIn({ user }) {
      logSecurityEvent("user_signin", {
        userId: user.id,
        timestamp: new Date().toISOString(),
      })
    },
  },

  debug: process.env.NODE_ENV === "development",
})
