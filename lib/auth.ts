import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import { logSecurityEvent } from "@/lib/auth-helpers"

// Ensure JWT secret is set
if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set")
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Ensure OAuth uses proper security settings
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Input validation
        const email = credentials.email as string
        const password = credentials.password as string

        if (email.length > 255 || password.length > 255) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: email.toLowerCase().trim()
          }
        })

        if (!user || !user.password) {
          // Use same timing to prevent user enumeration
          await bcrypt.compare(password, "$2a$10$invalidhashtopreventtimingattacks12345678901234567890123")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - session regeneration interval
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
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
      // On sign in, add user data to token
      if (user) {
        token.role = user.role
        token.id = user.id
        // Add timestamp for session validation
        token.iat = Math.floor(Date.now() / 1000)

        // Fetch USN from profile
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          select: { usn: true }
        })
        token.usn = profile?.usn ?? null
      }

      // On session update, refresh user data from database
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true, email: true, name: true, image: true }
        })

        if (dbUser) {
          token.role = dbUser.role
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
        }

        // Refresh USN from profile
        const profile = await prisma.profile.findUnique({
          where: { userId: token.sub! },
          select: { usn: true }
        })
        token.usn = profile?.usn ?? null
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.email = token.email!
        session.user.name = token.name
        session.user.image = token.picture
        session.user.usn = token.usn
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure email is verified
      if (account?.provider === "google") {
        return true // Google emails are pre-verified
      }

      // For credentials, verification is checked in authorize
      return true
    }
  },
  events: {
    async createUser({ user }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        if (dbUser && !dbUser.emailVerified) {
          await sendVerificationEmail(user.email, user.name || "User")
        }
      }
    },
    async signIn({ user }) {
      // Log sign in for security monitoring
      logSecurityEvent("user_signin", { userId: user.id, timestamp: new Date().toISOString() })
    }
  },
  // Enable debug only in development
  debug: process.env.NODE_ENV === "development",
})
